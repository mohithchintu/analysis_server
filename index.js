const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000;
const DATA_FILE = "./data.json";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello this is local project");
});

// Get all data
app.get("/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }
    res.json(JSON.parse(data));
  });
});

// Get all companies
app.get("/companies", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }
    const currentData = JSON.parse(data || "{}");
    res.json(currentData.companies || []);
  });
});

// Get all transactions
app.get("/transactions", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }
    const currentData = JSON.parse(data || "{}");
    res.json(currentData.transactions || []);
  });
});

// Write data to the file
app.post("/data", (req, res) => {
  const { companies, transactions } = req.body;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    const currentData = JSON.parse(data || "{}");
    currentData.companies = [...(currentData.companies || []), ...companies];
    currentData.transactions = [
      ...(currentData.transactions || []),
      ...transactions,
    ];

    fs.writeFile(
      DATA_FILE,
      JSON.stringify(currentData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing data file" });
        }
        res.json({ message: "Data updated successfully" });
      }
    );
  });
});

// Delete a company by index
app.post("/delete-company", (req, res) => {
  const { index } = req.body;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    const currentData = JSON.parse(data || "{}");
    if (
      !currentData.companies ||
      index < 0 ||
      index >= currentData.companies.length
    ) {
      return res.status(400).json({ message: "Invalid company index" });
    }

    currentData.companies.splice(index, 1);

    fs.writeFile(
      DATA_FILE,
      JSON.stringify(currentData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing data file" });
        }
        res.json({ message: "Company deleted successfully" });
      }
    );
  });
});

// Edit a company by index
app.put("/update-company", (req, res) => {
  const { index, updatedCompany } = req.body;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    const currentData = JSON.parse(data || "{}");

    if (
      !currentData.companies ||
      index < 0 ||
      index >= currentData.companies.length
    ) {
      return res.status(400).json({ message: "Invalid company index" });
    }

    currentData.companies[index] = {
      ...currentData.companies[index],
      ...updatedCompany,
    };

    fs.writeFile(
      DATA_FILE,
      JSON.stringify(currentData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing data file" });
        }
        res.json({ message: "Company updated successfully" });
      }
    );
  });
});

// Utility Functions for File Operations
const readDataFile = (callback) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, JSON.parse(data || "{}"));
  });
};

const writeDataFile = (data, callback) => {
  fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8", callback);
};

// Add a new transaction
app.post("/add-transaction", (req, res) => {
  const newTransaction = req.body;

  readDataFile((err, currentData) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    currentData.transactions = [
      ...(currentData.transactions || []),
      newTransaction,
    ];

    writeDataFile(currentData, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing data file" });
      }
      res.json({ message: "Transaction added successfully" });
    });
  });
});

// Edit a transaction by index
app.put("/update-transaction", (req, res) => {
  const { index, updatedTransaction } = req.body;

  readDataFile((err, currentData) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    if (
      !currentData.transactions ||
      index < 0 ||
      index >= currentData.transactions.length
    ) {
      return res.status(400).json({ message: "Invalid transaction index" });
    }

    currentData.transactions[index] = {
      ...currentData.transactions[index],
      ...updatedTransaction,
    };

    writeDataFile(currentData, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing data file" });
      }
      res.json({ message: "Transaction updated successfully" });
    });
  });
});

// Delete a transaction by index
app.delete("/delete-transaction", (req, res) => {
  const { index } = req.body;

  readDataFile((err, currentData) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data file" });
    }

    if (
      !currentData.transactions ||
      index < 0 ||
      index >= currentData.transactions.length
    ) {
      return res.status(400).json({ message: "Invalid transaction index" });
    }

    currentData.transactions.splice(index, 1);

    writeDataFile(currentData, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing data file" });
      }
      res.json({ message: "Transaction deleted successfully" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
