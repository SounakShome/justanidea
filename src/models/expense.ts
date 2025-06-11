import {  Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
    {
        expenseId: { type: String, required: true, unique: true },
        date: { type: Date, required: true },
        category: { type: Schema.Types.ObjectId, ref: "ExpenseCategory", required: true },
        userId: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
    },
    { timestamps: true }
);


export default models.Expense || model("Expense", ExpenseSchema);