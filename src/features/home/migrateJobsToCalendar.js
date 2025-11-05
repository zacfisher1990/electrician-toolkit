/**
 * Migration Utility: Sync Existing Jobs to Calendar
 * 
 * This script creates calendar assignments for all existing jobs
 * that have a date field but no calendar assignment yet.
 * 
 * Run this ONCE after implementing the calendar system to ensure
 * all existing jobs appear on the calendar.
 */

import { db, auth } from '../../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { assignJobToDate } from '../home/jobCalendarService';

export const migrateExistingJobsToCalendar = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error('❌ User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    console.log('🔄 Starting migration: Syncing existing jobs to calendar...');

    // Get all jobs
    const jobsRef = collection(db, 'users', userId, 'jobs');
    const jobsSnapshot = await getDocs(jobsRef);
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Found ${jobs.length} total jobs`);

    // Get all existing calendar assignments
    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    const existingAssignments = assignmentsSnapshot.docs.map(doc => doc.data());

    // Create a Set of job IDs that already have assignments
    const jobsWithAssignments = new Set(
      existingAssignments.map(a => `${a.jobId}-${a.date}`)
    );

    console.log(`✅ Found ${existingAssignments.length} existing calendar assignments`);

    // Find jobs that have dates but no calendar assignments
    const jobsToMigrate = jobs.filter(job => {
      const hasDate = job.date && job.date !== '';
      const assignmentKey = `${job.id}-${job.date}`;
      const hasNoAssignment = !jobsWithAssignments.has(assignmentKey);
      return hasDate && hasNoAssignment;
    });

    console.log(`🎯 Found ${jobsToMigrate.length} jobs to migrate`);

    if (jobsToMigrate.length === 0) {
      console.log('✅ No migration needed - all jobs already synced!');
      return { 
        success: true, 
        migrated: 0, 
        total: jobs.length 
      };
    }

    // Create calendar assignments for these jobs
    let successCount = 0;
    let failCount = 0;

    for (const job of jobsToMigrate) {
      try {
        await assignJobToDate(job.id, job.date, {
          title: job.title || job.name,
          client: job.client,
          status: job.status
        });
        successCount++;
        console.log(`✅ Migrated: ${job.title} (${job.date})`);
      } catch (error) {
        failCount++;
        console.error(`❌ Failed to migrate job ${job.id}:`, error);
      }
    }

    console.log('🎉 Migration complete!');
    console.log(`   ✅ Successfully migrated: ${successCount} jobs`);
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount} jobs`);
    }

    return {
      success: true,
      migrated: successCount,
      failed: failCount,
      total: jobs.length
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper function: Check if migration is needed
 */
export const checkMigrationStatus = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    // Get jobs with dates
    const jobsRef = collection(db, 'users', userId, 'jobs');
    const jobsSnapshot = await getDocs(jobsRef);
    const jobsWithDates = jobsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(job => job.date && job.date !== '');

    // Get calendar assignments
    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    const assignments = assignmentsSnapshot.docs.map(doc => doc.data());

    const jobsWithAssignments = new Set(
      assignments.map(a => `${a.jobId}-${a.date}`)
    );

    const needsMigration = jobsWithDates.filter(job => {
      return !jobsWithAssignments.has(`${job.id}-${job.date}`);
    });

    return {
      totalJobs: jobsSnapshot.docs.length,
      jobsWithDates: jobsWithDates.length,
      existingAssignments: assignments.length,
      needsMigration: needsMigration.length
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return null;
  }
};

// Export for use in components
export default migrateExistingJobsToCalendar;