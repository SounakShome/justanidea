import { Schema, model, models } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';  // Import uuid library

const companySchema = new Schema({
    code: {
        type: String,  // Use String type instead of UUID
        required: true,
        default: () => uuidv4(),
    },
    GSTIN: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    owner: {
        type: [String],
        required: true,
    },
    employees: {
        type: [String],
    },
    address: {
        type: String,
        required: true,
    },
});

const Company = models.Company || model('Company', companySchema);
export default Company;