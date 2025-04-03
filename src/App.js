import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import "./App.css";

const App = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", size: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch grocery items from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "grocery43"), (snapshot) => {
      setProducts(
        snapshot.docs.map((doc, index) => ({
          id: doc.id,
          index: index + 1,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  // Update product status (Optimistic UI)
  const updateStatus = async (event, id) => {
    const newStatus = event.target.checked ? "picked" : "not picked";

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      await updateDoc(doc(db, "grocery43", id), { status: newStatus });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Optimized notes update (Only on blur)
  const updateNotes = async (id, newNotes) => {
    try {
      await updateDoc(doc(db, "grocery43", id), { notes: newNotes || null });
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      try {
        await deleteDoc(doc(db, "grocery43", id));
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  // Reset all statuses and notes
  const resetAll = async () => {
    if (window.confirm("Reset all items?")) {
      products.forEach(async ({ id }) => {
        await updateDoc(doc(db, "grocery43", id), { status: null, notes: null });
      });
    }
  };

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";
    if (sortConfig.key === "size") {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    } else if (sortConfig.key === "name") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const printList = () => {
    const currentDate = new Date().toLocaleString();

    const printableContent = `
      <div class="print-container">
        <h2>Hi Deva, please check you montly grocery list</h2>
        <div class="date">${currentDate}</div>
        <table>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Size</th>
            <th>Cost</th>
          </tr>
          ${sortedProducts
        .map(
          (p, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${p.name}</td>
                  <td>${p.size}</td>
                  <td> </td>
                </tr>
              `
        )
        .join("")}
          <tr class="total">
            <td colspan="3">Total</td>
            <td>₹0.00</td>
          </tr>
        </table>
      </div>
    `;

    const printWindow = window.open("", "");
    printWindow.document.write(`
      <html>
        <head>
          <link rel="stylesheet" type="text/css" href="App.css" />
        </head>
        <body>${printableContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };



  return (
    <div className="container">
      <h2>Grocery List</h2>
      <button onClick={resetAll}>Reset All</button>
      <table>
        <thead>
          <tr>
            <th>S. No.</th>
            <th
              onClick={() =>
                setSortConfig({
                  key: "name",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className="sortable"
            >
              Product {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
            </th>
            <th
              onClick={() =>
                setSortConfig({
                  key: "size",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className="sortable"
            >
              Size {sortConfig.key === "size" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
            </th>
            <th
              onClick={() =>
                setSortConfig({
                  key: "status",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className="sortable"
            >
              Picked {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : ""}
            </th>
            <th>Notes</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(({ id, name, size, status, notes, index }) => (
            <tr
              key={id}
              className={status === "picked" ? "green-bg" : status === "not picked" ? "red-bg" : ""}
            >
              <td>{index}</td>

              <td>{name}</td>
              <td>{size}</td>
              <td>
                <input
                  type="checkbox"
                  checked={status === "picked"}
                  onChange={(event) => updateStatus(event, id)}
                />
              </td>
              <td className="notes-column">
                <input
                  className="notes-input"
                  type="text"
                  defaultValue={notes || ""}
                  placeholder="Add notes..."
                  onBlur={(e) => updateNotes(id, e.target.value)}
                />
              </td>
              <td>
                <button className="delete-btn" onClick={() => deleteProduct(id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stylish Add Product Form */}
      <div className="add-product-form">
        <h3>Add New Product</h3>
        <input
          className="product-input"
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Size (e.g., 1 Litre)"
          value={newProduct.size}
          onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
        />
        <button
          onClick={async () => {
            if (newProduct.name.trim() === "") return;
            await addDoc(collection(db, "grocery43"), {
              ...newProduct,
              status: null,
              notes: null,
            });
            setNewProduct({ name: "", size: "" });
          }}
        >
          Add Product
        </button>

      </div>

      <div className="add-product-form">
        <button onClick={printList}>Print</button>
      </div>
    </div>
  );
};

export default App;
