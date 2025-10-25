// src/features/estimates/materialsService.js
import { auth, db } from '../../firebase/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const MATERIALS_COLLECTION = 'materials';

/**
 * Get all saved materials for the current user
 */
export const getUserMaterials = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const materialsRef = collection(db, MATERIALS_COLLECTION);
    const q = query(materialsRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);

    const materials = [];
    querySnapshot.forEach((doc) => {
      materials.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by usage count (most used first), then alphabetically
    materials.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      return a.name.localeCompare(b.name);
    });

    return materials;
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
};

/**
 * Add a new material or update if it already exists
 * Returns the material ID
 */
export const saveMaterial = async (materialData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { name, cost } = materialData;
    
    // Check if material with same name already exists
    const materialsRef = collection(db, MATERIALS_COLLECTION);
    const q = query(
      materialsRef, 
      where('userId', '==', user.uid),
      where('name', '==', name)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Material exists - update it
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
      
      await updateDoc(doc(db, MATERIALS_COLLECTION, existingDoc.id), {
        cost: parseFloat(cost),
        usageCount: (existingData.usageCount || 0) + 1,
        lastUsed: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return existingDoc.id;
    } else {
      // New material - create it
      const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), {
        userId: user.uid,
        name: name,
        cost: parseFloat(cost),
        usageCount: 1,
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving material:', error);
    throw error;
  }
};

/**
 * Increment usage count when material is used
 */
export const incrementMaterialUsage = async (materialId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const materialRef = doc(db, MATERIALS_COLLECTION, materialId);
    const materialDoc = await getDocs(query(
      collection(db, MATERIALS_COLLECTION),
      where('userId', '==', user.uid)
    ));
    
    const material = materialDoc.docs.find(d => d.id === materialId);
    if (material) {
      const currentCount = material.data().usageCount || 0;
      await updateDoc(materialRef, {
        usageCount: currentCount + 1,
        lastUsed: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing material usage:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Delete a saved material
 */
export const deleteMaterial = async (materialId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await deleteDoc(doc(db, MATERIALS_COLLECTION, materialId));
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

/**
 * Search materials by name (for autocomplete)
 */
export const searchMaterials = async (searchTerm) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const materials = await getUserMaterials();
    
    if (!searchTerm) {
      return materials;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return materials.filter(material => 
      material.name.toLowerCase().includes(lowerSearch)
    );
  } catch (error) {
    console.error('Error searching materials:', error);
    throw error;
  }
};