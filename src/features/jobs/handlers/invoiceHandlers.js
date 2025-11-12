import { clearJobsCache } from '../../../utils/localStorageUtils';

/**
 * Invoice operation handlers
 */
export const createInvoiceHandlers = ({
  estimates,
  jobs,
  loadJobs,
  setViewingInvoice
}) => {

  const generateInvoiceFromJob = async (job) => {
    // Get linked estimates
    const jobEstimates = estimates.filter(est => 
      job.estimateIds?.includes(est.id)
    );
    
    // Build line items from estimates
    const lineItems = [];
    
    if (jobEstimates.length > 0) {
      // If estimates exist, use them
      jobEstimates.forEach(estimate => {
        // Add labor as line item
        if (estimate.laborHours && estimate.laborRate) {
          lineItems.push({
            description: `Labor: ${estimate.laborHours} hours @ $${estimate.laborRate}/hr`,
            quantity: 1,
            rate: estimate.laborHours * estimate.laborRate
          });
        }
        
        // Add materials as line items
        if (estimate.materials && estimate.materials.length > 0) {
          estimate.materials.forEach(material => {
            lineItems.push({
              description: material.name,
              quantity: material.quantity || 1,
              rate: parseFloat(material.cost) || 0
            });
          });
        }
      });
    } else {
      // If no estimates, create a single line item from job's estimated cost
      if (job.estimatedCost && parseFloat(job.estimatedCost) > 0) {
        lineItems.push({
          description: `${job.title || job.name} - Labor & Materials`,
          quantity: 1,
          rate: parseFloat(job.estimatedCost)
        });
      }
    }
    
    // Calculate total
    const total = lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.rate), 0
    );
    
    // Generate invoice number
    const { getNextInvoiceNumber } = await import('../../invoices/invoicesService');
    const invoiceNumber = await getNextInvoiceNumber();
    
    return {
      invoiceNumber: invoiceNumber,
      client: job.client,
      clientEmail: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      lineItems: lineItems,
      notes: `Invoice for job: ${job.title || job.name}`,
      status: 'Pending',
      amount: total,
      jobId: job.id
    };
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      const { createInvoice } = await import('../../invoices/invoicesService');
      
      // Save invoice
      const invoiceId = await createInvoice(invoiceData);
      
      // Update job with invoice ID
      const { updateJob } = await import('../jobsService');
      const job = jobs.find(j => j.id === invoiceData.jobId);
      if (job) {
        await updateJob(invoiceData.jobId, {
          ...job,
          invoiceId: invoiceId
        });
      }
      
      // Close modal and refresh
      setViewingInvoice(null);
      clearJobsCache();
      loadJobs();
      
      return invoiceId;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  const handleViewInvoice = async (job) => {
    if (job.invoiceId) {
      // Load and show existing invoice
      const { getUserInvoices } = await import('../../invoices/invoicesService');
      const invoices = await getUserInvoices();
      const invoice = invoices.find(inv => inv.id === job.invoiceId);
      if (invoice) {
        setViewingInvoice(invoice);
      }
    } else {
      // Generate new invoice from job
      // Check if job has estimated cost or estimates
      const hasEstimates = job.estimateIds && job.estimateIds.length > 0;
      const hasEstimatedCost = job.estimatedCost && parseFloat(job.estimatedCost) > 0;
      
      if (!hasEstimates && !hasEstimatedCost) {
        alert('This job has no estimated cost or estimates. Please add a cost or estimate first.');
        return;
      }
      
      try {
        // Generate the invoice
        const generatedInvoice = await generateInvoiceFromJob(job);
        
        // Automatically save it
        const invoiceId = await handleSaveInvoice(generatedInvoice);
        
        // Load and display the saved invoice
        const { getUserInvoices } = await import('../../invoices/invoicesService');
        const invoices = await getUserInvoices();
        const savedInvoice = invoices.find(inv => inv.id === invoiceId);
        if (savedInvoice) {
          setViewingInvoice(savedInvoice);
        }
      } catch (error) {
        console.error('Error creating invoice:', error);
        alert('Failed to create invoice. Please try again.');
      }
    }
  };

  return {
    generateInvoiceFromJob,
    handleSaveInvoice,
    handleViewInvoice
  };
};