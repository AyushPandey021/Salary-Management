salary-app/
│
├── app/
│   ├── (auth)/                  ← Authentication Flow
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │
│   ├── (tabs)/                  ← Main App After Login
│   │   ├── _layout.tsx          ← Bottom Tabs Layout
│   │   ├── dashboard.tsx        ← Overview / Summary
│   │   ├── salary.tsx           ← Add Monthly Salary
│   │   ├── expenses.tsx         ← Add / View Expenses
│   │   ├── investments.tsx      ← Manage Investments
│   │
│   ├── _layout.tsx              ← Root Stack
│
├── src/
│   ├── components/              ← Reusable UI (Card, Input, Button)
│   │   ├── AppButton.tsx
│   │   ├── AppInput.tsx
│   │   ├── SummaryCard.tsx
│   │
│   ├── services/                ← API Calls
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── salary.service.ts
│   │
│   ├── store/                   ← Global State (Zustand recommended)
│   │   ├── auth.store.ts
│   │   ├── finance.store.ts
│   │
│   ├── utils/
│   │   ├── calculateSummary.ts
│   │   ├── formatCurrency.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── finance.types.ts
│
├── assets/
├── constants/
│   ├── colors.ts
│   ├── theme.ts
│
├── package.json
├── app.json




<!-- Backend  -->
backend/
│
├── app/
│   ├── main.py
│
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│
│   ├── db/
│   │   ├── database.py
│
│   ├── models/
│   │   ├── user.py
│   │   ├── salary.py
│   │   ├── expense.py
│   │   ├── investment.py
│
│   ├── schemas/
│   │   ├── user_schema.py
│   │   ├── salary_schema.py
│   │   ├── expense_schema.py
│   │   ├── investment_schema.py
│
│   ├── routes/
│   │   ├── auth.py
│   │   ├── salary.py
│   │   ├── expense.py
│   │   ├── investment.py
│   │   ├── analytics.py
│
│   ├── services/
│   │   ├── analytics_service.py
│
├── requirements.txt


venv\Scripts\Activate
uvicorn app.main:app --reload
venv\Scripts\Activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


npx expo start -c
expo run in android studio : 

Testing user:
ak 
ak@gmail.com
11