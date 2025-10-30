// src/features/invoices/invoicesService.js
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
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const INVOICES_COLLECTION = 'invoices';

/**
 * Get all invoices for the current user
 */
export const getUserInvoices = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const invoicesRef = collection(db, INVOICES_COLLECTION);
    const q = query(
      invoicesRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return invoices;
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
};

/**
 * Create a new invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
      userId: user.uid,
      ...invoiceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Update an existing invoice
 */
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (invoiceId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

/**
 * Get the next invoice number
 */
export const getNextInvoiceNumber = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const invoices = await getUserInvoices();
    
    if (invoices.length === 0) {
      return 'INV-001';
    }

    // Extract numbers from existing invoice numbers
    const numbers = invoices
      .map(inv => {
        const match = inv.invoiceNumber.match(/INV-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    if (numbers.length === 0) {
      return 'INV-001';
    }

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `INV-${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return 'INV-001';
  }
};

/**
 * Update invoice status
 */
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
    await updateDoc(invoiceRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};