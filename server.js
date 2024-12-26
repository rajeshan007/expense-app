const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const port = 3061
const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/expense-app-feb-2023")
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log("error connected to db", err);
    })

app.use(express.json())
app.use(cors())

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const Category = mongoose.model("Category", categorySchema)
app.get('/api/categories', (req, res) => {
    Category.find()
        .then((cat) => {
            res.json(cat)
        })
        .catch((err) => {
            res.json(err)
        })
})

app.post('/api/categories', (req, res) => {
    const body = req.body
    const categorey = new Category(body)
    categorey.save()
        .then((cat) => {
            res.json(cat)
        })
        .catch((err) => {
            res.json(err)
        })
})
app.put('/api/categories/:id', (req, res) => {
    const id = req.params.id
    const body = req.body
    Category.findByIdAndUpdate(id, body, { new: true })
        .then((cat) => {
            res.json(cat)
        })
        .catch((err) => {
            res.json(err)
        })
})
app.delete('/api/categories/:id', (req, res) => {
    const id = req.params.id
    Category.findByIdAndDelete(id)
        .then((cat) => {
            res.json(cat)
        })
        .catch((err) => {
            res.json(err)
        })
})


// create a expense Schema and model
const expenseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        max: 128
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    expenseDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    notes: {
        type: String
    }
})
//expense model
const Expense = mongoose.model("Expense", expenseSchema)

// get all the expenses
app.get('/api/expenses', (req, res) => {
    Expense.find()
        .then((exp) => {
            res.json(exp)
        })
        .catch((err) => {
            res.json(err)
        })
})

app.post('/api/expenses', (req, res) => {
    const body = req.body
    Expense.create(body)
        .then((exp) => {
            res.json(exp)
        })
        .catch((err) => {
            res.json(err)
        })
})
// api to get all the categories and expense at a time
app.get('/api/expenses/report', (req, res) => {
    Promise.all([Category.find(), Expense.find()])
        .then((values) => {
            const [categories, expenses] = values
            const result = {}
            categories.forEach((cat) => {
                const categoryExpenses = expenses.filter((exp) => { return exp.categoryId.toString() == cat._id.toString() })
                const sum = categoryExpenses.reduce((acc, cv) => {
                    return acc + cv.amount
                }, 0)
                result[cat.name] = sum
            })
            res.json({
                result: Object.entries(result)
            })
        })
        .catch((e) => {
            console.log(e.message);
        })
})

app.listen(port, () => {
    console.log("server is running on port", port);
})



