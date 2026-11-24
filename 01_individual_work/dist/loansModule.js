"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanManager = exports.CarLoan = exports.HomeLoan = exports.BaseLoan = void 0;
// 3. აბსტრაქცია (Abstract Class + protected)
class BaseLoan {
    constructor(id, clientName, principalAmount, termMonths, creditScore) {
        // protected თვისება, რომელიც საერთოა შვილი კლასებისთვის
        this.monthsInYear = 12;
        this.id = id;
        this.clientName = clientName;
        this.principalAmount = principalAmount;
        this.termMonths = termMonths;
        this.creditScore = creditScore;
    }
    // protected დამხმარე მეთოდი საერთო გამოთვლისთვის
    calculateDecliningPayment(annualRate) {
        const monthlyRate = annualRate / this.monthsInYear;
        const basePrincipal = this.principalAmount / this.termMonths;
        const averageInterest = ((this.principalAmount + basePrincipal) / 2) * monthlyRate;
        return Number((basePrincipal + averageInterest).toFixed(2));
    }
    // საჯარო ამონაწერის ფორმირება Omit ტიპის გამოყენებით
    toPublicStatement() {
        const { creditScore: _hiddenScore, ...safeLoanData } = this;
        return {
            ...safeLoanData,
            loanType: this.getLoanType(),
            monthlyPayment: this.calculateMonthlyPayment(),
        };
    }
}
exports.BaseLoan = BaseLoan;
// 4. მემკვიდრეობითობა და პოლიმორფიზმი (HomeLoan & CarLoan)
class HomeLoan extends BaseLoan {
    constructor(id, clientName, principalAmount, termMonths, creditScore, propertyAddress) {
        super(id, clientName, principalAmount, termMonths, creditScore);
        this.propertyAddress = propertyAddress;
        this.annualInterestRate = 0.09; // იპოთეკური სესხი: 9% წლიური
    }
    getLoanType() {
        return "HomeLoan";
    }
    // პოლიმორფულად გადაფარული მეთოდი იპოთეკისთვის
    calculateMonthlyPayment() {
        const monthlyRate = this.annualInterestRate / this.monthsInYear;
        const factor = Math.pow(1 + monthlyRate, this.termMonths);
        const annuity = (this.principalAmount * (monthlyRate * factor)) / (factor - 1);
        return Number(annuity.toFixed(2));
    }
}
exports.HomeLoan = HomeLoan;
class CarLoan extends BaseLoan {
    constructor(id, clientName, principalAmount, termMonths, creditScore, vehicleVin) {
        super(id, clientName, principalAmount, termMonths, creditScore);
        this.vehicleVin = vehicleVin;
        this.annualInterestRate = 0.15; // ავტოსესხი: 15% წლიური
    }
    getLoanType() {
        return "CarLoan";
    }
    // პოლიმორფულად გადაფარული მეთოდი ავტოსესხისთვის
    calculateMonthlyPayment() {
        return this.calculateDecliningPayment(this.annualInterestRate);
    }
}
exports.CarLoan = CarLoan;
// 5. ინკაფსულაცია (LoanManager — private მასივი და საჯარო მეთოდები)
class LoanManager {
    constructor() {
        this.loans = [];
    }
    addLoan(loan) {
        this.loans.push(loan);
    }
    getLoanById(id) {
        return this.loans.find((loan) => loan.id === id);
    }
    getPublicStatements() {
        return this.loans.map((loan) => loan.toPublicStatement());
    }
    getTotalPortfolioPrincipal() {
        return this.loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    }
}
exports.LoanManager = LoanManager;
// --- გაშვების მაგალითი ---
const manager = new LoanManager();
const homeLoan = new HomeLoan("LN-101", "ნინო ბერიძე", 120000, 120, 780, "თბილისი, ჭავჭავაძის გამზ. 15");
const carLoan = new CarLoan("LN-102", "გიორგი კაპანაძე", 25000, 36, 690, "JTEBU5JR7K5612345");
manager.addLoan(homeLoan);
manager.addLoan(carLoan);
console.log("=== საჯარო ამონაწერები (creditScore დამალულია Omit-ით) ===");
console.log(manager.getPublicStatements());
console.log("=== სესხების პორტფელის ჯამური ძირი ===");
console.log(`${manager.getTotalPortfolioPrincipal()} ლარი`);
