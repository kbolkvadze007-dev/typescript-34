// 1. ინტერფეისები (Interfaces & extends)
export interface ILoan {
  id: string;
  clientName: string;
  principalAmount: number; // სესხის ძირი თანხა (ლარი)
  termMonths: number;      // ვადა თვეებში
  creditScore: number;     // კონფიდენციალური საკრედიტო რეიტინგი
}

export interface ICommercialLoan extends ILoan {
  companyName: string;
  guarantees: string[];    // იურიდიული პირის გარანტიები
}

// 2. მონაცემთა დაცვა (Omit<T, K>) — საჯარო ამონაწერი საკრედიტო რეიტინგის გარეშე
export type PublicLoanStatement = Omit<ILoan, "creditScore"> & {
  loanType: "HomeLoan" | "CarLoan";
  monthlyPayment: number;
};

// 3. აბსტრაქცია (Abstract Class + protected)
export abstract class BaseLoan implements ILoan {
  public readonly id: string;
  public readonly clientName: string;
  public readonly principalAmount: number;
  public readonly termMonths: number;
  public readonly creditScore: number;

  // protected თვისება, რომელიც საერთოა შვილი კლასებისთვის
  protected readonly monthsInYear: number = 12;

  constructor(
    id: string,
    clientName: string,
    principalAmount: number,
    termMonths: number,
    creditScore: number
  ) {
    this.id = id;
    this.clientName = clientName;
    this.principalAmount = principalAmount;
    this.termMonths = termMonths;
    this.creditScore = creditScore;
  }

  // protected დამხმარე მეთოდი საერთო გამოთვლისთვის
  protected calculateDecliningPayment(annualRate: number): number {
    const monthlyRate = annualRate / this.monthsInYear;
    const basePrincipal = this.principalAmount / this.termMonths;
    const averageInterest = ((this.principalAmount + basePrincipal) / 2) * monthlyRate;
    return Number((basePrincipal + averageInterest).toFixed(2));
  }

  // აბსტრაქტული მეთოდი, რომელსაც შვილი კლასები პოლიმორფულად გადაწერენ
  public abstract calculateMonthlyPayment(): number;

  public abstract getLoanType(): "HomeLoan" | "CarLoan";

  // საჯარო ამონაწერის ფორმირება Omit ტიპის გამოყენებით
  public toPublicStatement(): PublicLoanStatement {
    const { creditScore: _hiddenScore, ...safeLoanData } = this;
    return {
      ...safeLoanData,
      loanType: this.getLoanType(),
      monthlyPayment: this.calculateMonthlyPayment(),
    };
  }
}

// 4. მემკვიდრეობითობა და პოლიმორფიზმი (HomeLoan & CarLoan)
export class HomeLoan extends BaseLoan {
  private readonly annualInterestRate: number = 0.09; // იპოთეკური სესხი: 9% წლიური

  constructor(
    id: string,
    clientName: string,
    principalAmount: number,
    termMonths: number,
    creditScore: number,
    public readonly propertyAddress: string
  ) {
    super(id, clientName, principalAmount, termMonths, creditScore);
  }

  public getLoanType(): "HomeLoan" {
    return "HomeLoan";
  }

  // პოლიმორფულად გადაფარული მეთოდი იპოთეკისთვის
  public override calculateMonthlyPayment(): number {
    const monthlyRate = this.annualInterestRate / this.monthsInYear;
    const factor = Math.pow(1 + monthlyRate, this.termMonths);
    const annuity = (this.principalAmount * (monthlyRate * factor)) / (factor - 1);
    return Number(annuity.toFixed(2));
  }
}

export class CarLoan extends BaseLoan {
  private readonly annualInterestRate: number = 0.15; // ავტოსესხი: 15% წლიური

  constructor(
    id: string,
    clientName: string,
    principalAmount: number,
    termMonths: number,
    creditScore: number,
    public readonly vehicleVin: string
  ) {
    super(id, clientName, principalAmount, termMonths, creditScore);
  }

  public getLoanType(): "CarLoan" {
    return "CarLoan";
  }

  // პოლიმორფულად გადაფარული მეთოდი ავტოსესხისთვის
  public override calculateMonthlyPayment(): number {
    return this.calculateDecliningPayment(this.annualInterestRate);
  }
}

// 5. ინკაფსულაცია (LoanManager — private მასივი და საჯარო მეთოდები)
export class LoanManager {
  private loans: BaseLoan[] = [];

  public addLoan(loan: BaseLoan): void {
    this.loans.push(loan);
  }

  public getLoanById(id: string): BaseLoan | undefined {
    return this.loans.find((loan) => loan.id === id);
  }

  public getPublicStatements(): PublicLoanStatement[] {
    return this.loans.map((loan) => loan.toPublicStatement());
  }

  public getTotalPortfolioPrincipal(): number {
    return this.loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  }
}

// --- გაშვების მაგალითი ---
const manager = new LoanManager();

const homeLoan = new HomeLoan(
  "LN-101",
  "ნინო ბერიძე",
  120000,
  120,
  780,
  "თბილისი, ჭავჭავაძის გამზ. 15"
);

const carLoan = new CarLoan(
  "LN-102",
  "გიორგი კაპანაძე",
  25000,
  36,
  690,
  "JTEBU5JR7K5612345"
);

manager.addLoan(homeLoan);
manager.addLoan(carLoan);

console.log("=== საჯარო ამონაწერები (creditScore დამალულია Omit-ით) ===");
console.log(manager.getPublicStatements());

console.log("=== სესხების პორტფელის ჯამური ძირი ===");
console.log(`${manager.getTotalPortfolioPrincipal()} ლარი`);
