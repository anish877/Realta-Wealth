"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.verifyUser = verifyUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
async function createUser(email, password, fullName, role) {
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            fullName,
            role,
        },
    });
    return {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role,
    };
}
async function findUserByEmail(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (!user)
        return undefined;
    return {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role,
    };
}
async function verifyUser(email, password) {
    const user = await findUserByEmail(email);
    if (!user)
        return null;
    const matches = await bcryptjs_1.default.compare(password, user.passwordHash);
    return matches ? user : null;
}
// Seed demo user for quick start
void (async () => {
    const demoEmail = "advisor@example.com";
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: demoEmail } });
    if (!exists) {
        await createUser(demoEmail, "Password123!", "Demo Advisor", "advisor");
    }
})();
