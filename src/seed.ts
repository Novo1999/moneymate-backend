// src/seed.ts
import { config } from 'dotenv'
import 'reflect-metadata'
import { AppDataSource } from '../data-source'

import * as bcrypt from 'bcryptjs'
import { AccountType } from './database/postgresql/entity/accountType.entity'
import { Category } from './database/postgresql/entity/category.entity'
import { Transaction } from './database/postgresql/entity/transaction.entity'
import { User } from './database/postgresql/entity/user.entity'
import { Currency } from './enums/currency'
import { ExpenseCategory, IncomeCategory, TransactionType } from './enums/transaction'
import { DayOfWeek } from './enums/week'
config()

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize()
    console.log('Database connected for seeding')

    // Get repositories
    const userRepo = AppDataSource.getRepository(User)
    const accountTypeRepo = AppDataSource.getRepository(AccountType)
    const categoryRepo = AppDataSource.getRepository(Category)
    const transactionRepo = AppDataSource.getRepository(Transaction)

    // Clear existing data (optional - comment out if you don't want to clear)
    console.log('Clearing existing data...')
    // await transactionRepo.clear()
    // await categoryRepo.clear()
    // await accountTypeRepo.clear()
    // await userRepo.clear()

    // Seed Users
    console.log('Seeding users...')

    const hashedPassword1 = await bcrypt.hash('password123', 10)
    const hashedPassword2 = await bcrypt.hash('password456', 10)

    const user1 = userRepo.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword1,
      currency: Currency.USD,
      firstDayOfWeek: DayOfWeek.MONDAY,
      firstDayOfMonth: 1,
      viewMode: 'day',
    })

    const user2 = userRepo.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: hashedPassword2,
      currency: Currency.EUR,
      firstDayOfWeek: DayOfWeek.SUNDAY,
      firstDayOfMonth: 1,
      viewMode: 'week',
    })

    await userRepo.save([user1, user2])
    console.log('✓ Users seeded')

    // Seed Categories for User 1
    console.log('Seeding categories...')
    const user1Categories = [
      // Income categories
      { name: 'Salary', type: TransactionType.INCOME, icon: '💰', user: user1 },
      { name: 'Freelance Work', type: TransactionType.INCOME, icon: '💼', user: user1 },
      { name: 'Investment Returns', type: TransactionType.INCOME, icon: '📈', user: user1 },
      { name: 'Gifts Received', type: TransactionType.INCOME, icon: '🎁', user: user1 },

      // Expense categories
      { name: 'Groceries', type: TransactionType.EXPENSE, icon: '🛒', user: user1 },
      { name: 'Restaurants', type: TransactionType.EXPENSE, icon: '🍔', user: user1 },
      { name: 'Shopping', type: TransactionType.EXPENSE, icon: '🛍️', user: user1 },
      { name: 'Transportation', type: TransactionType.EXPENSE, icon: '🚗', user: user1 },
      { name: 'Entertainment', type: TransactionType.EXPENSE, icon: '🎬', user: user1 },
      { name: 'Utilities', type: TransactionType.EXPENSE, icon: '💡', user: user1 },
    ]

    const user2Categories = [
      { name: 'Monthly Salary', type: TransactionType.INCOME, icon: '💵', user: user2 },
      { name: 'Side Hustle', type: TransactionType.INCOME, icon: '💻', user: user2 },
      { name: 'Food & Dining', type: TransactionType.EXPENSE, icon: '🍕', user: user2 },
      { name: 'Rent', type: TransactionType.EXPENSE, icon: '🏠', user: user2 },
      { name: 'Gas', type: TransactionType.EXPENSE, icon: '⛽', user: user2 },
    ]

    const savedCategories = await categoryRepo.save([...user1Categories, ...user2Categories])
    console.log('✓ Categories seeded')

    // Seed Account Types for User 1
    console.log('Seeding account types...')
    const user1Account1 = accountTypeRepo.create({
      name: 'Main Checking',
      user: user1,
      balance: 5000.0,
    })

    const user1Account2 = accountTypeRepo.create({
      name: 'Savings',
      user: user1,
      balance: 15000.0,
    })

    const user1Account3 = accountTypeRepo.create({
      name: 'Credit Card',
      user: user1,
      balance: -1200.0,
    })

    const user2Account1 = accountTypeRepo.create({
      name: 'Bank Account',
      user: user2,
      balance: 3500.0,
    })

    const user2Account2 = accountTypeRepo.create({
      name: 'Cash',
      user: user2,
      balance: 250.0,
    })

    const savedAccountTypes = await accountTypeRepo.save([user1Account1, user1Account2, user1Account3, user2Account1, user2Account2])
    console.log('✓ Account types seeded')

    // Update active account for users
    user1.activeAccountTypeId = user1Account1.id
    user2.activeAccountTypeId = user2Account1.id
    await userRepo.save([user1, user2])

    // Seed Transactions
    console.log('Seeding transactions...')
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const transactions = [
      // User 1 Income transactions
      {
        user: user1,
        accountType: user1Account1,
        money: 5000.0,
        type: TransactionType.INCOME,
        category: IncomeCategory.SALARY,
        note: 'Monthly salary payment',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        user: user1,
        accountType: user1Account2,
        money: 500.0,
        type: TransactionType.INCOME,
        category: IncomeCategory.INTERESTS,
        note: 'Savings account interest',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        user: user1,
        accountType: user1Account1,
        money: 800.0,
        type: TransactionType.INCOME,
        category: IncomeCategory.SALE,
        note: 'Freelance project completed',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 15),
      },

      // User 1 Expense transactions
      {
        user: user1,
        accountType: user1Account1,
        money: 120.5,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.FOOD_DRINKS,
        note: 'Weekly groceries',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 5),
      },
      {
        user: user1,
        accountType: user1Account3,
        money: 85.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.FOOD_DRINKS,
        note: 'Dinner with friends',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 8),
      },
      {
        user: user1,
        accountType: user1Account1,
        money: 1200.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.HOUSING,
        note: 'Monthly rent',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        user: user1,
        accountType: user1Account3,
        money: 250.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.SHOPPING,
        note: 'New shoes and clothes',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 10),
      },
      {
        user: user1,
        accountType: user1Account1,
        money: 60.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.TRANSPORTATION,
        note: 'Gas refill',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 12),
      },
      {
        user: user1,
        accountType: user1Account1,
        money: 150.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.COMMUNICATION_PC,
        note: 'Internet and phone bill',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 5),
      },
      {
        user: user1,
        accountType: user1Account3,
        money: 45.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.LIFE_ENTERTAINMENT,
        note: 'Movie tickets',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 18),
      },

      // User 2 Income transactions
      {
        user: user2,
        accountType: user2Account1,
        money: 4500.0,
        type: TransactionType.INCOME,
        category: IncomeCategory.SALARY,
        note: 'December salary',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        user: user2,
        accountType: user2Account2,
        money: 300.0,
        type: TransactionType.INCOME,
        category: IncomeCategory.GIFTS,
        note: 'Birthday gift',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 20),
      },

      // User 2 Expense transactions
      {
        user: user2,
        accountType: user2Account1,
        money: 950.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.HOUSING,
        note: 'Monthly rent',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
      {
        user: user2,
        accountType: user2Account2,
        money: 75.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.FOOD_DRINKS,
        note: 'Restaurant',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 7),
      },
      {
        user: user2,
        accountType: user2Account1,
        money: 50.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.TRANSPORTATION,
        note: 'Gas',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 10),
      },
      {
        user: user2,
        accountType: user2Account1,
        money: 200.0,
        type: TransactionType.EXPENSE,
        category: ExpenseCategory.SHOPPING,
        note: 'Clothing',
        createdAt: new Date(now.getFullYear(), now.getMonth(), 15),
      },
    ]

    await transactionRepo.save(transactions)
    console.log('✓ Transactions seeded')

    console.log('\n✅ Seeding completed successfully!')
    console.log(`- ${await userRepo.count()} users`)
    console.log(`- ${await accountTypeRepo.count()} account types`)
    console.log(`- ${await categoryRepo.count()} categories`)
    console.log(`- ${await transactionRepo.count()} transactions`)
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await AppDataSource.destroy()
    console.log('Database connection closed')
  }
}

// Run the seed
seed()
