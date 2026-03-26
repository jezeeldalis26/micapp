import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trash2, TrendingUp, TrendingDown, Target, Pencil, Check, Lightbulb, Menu, X, FileText, Download, UserCog, LogOut, AlertTriangle, PiggyBank, Wallet, PieChart as PieChartIcon, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* --- IMPORTACIONES DE FIREBASE --- */
// Se asume que la inicialización real (initializeApp, getFirestore, etc.) está en este archivo local.
// Asegúrate de tener este archivo './firebase' en tu proyecto exportando auth, db y googleProvider.
import { auth, db, googleProvider } from './firebase'; 

import { signInWithPopup, onAuthStateChanged, signOut, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

/* ---------------- ESTILOS GLOBALES & MODO OSCURO ---------------- */
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
  background-color: #f8fafc;
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease;
}

.bg-mesh {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background:
    radial-gradient(at 0% 0%, rgba(37,99,235,0.15), transparent 50%),
    radial-gradient(at 100% 0%, rgba(249,115,22,0.15), transparent 50%),
    radial-gradient(at 100% 100%, rgba(37,99,235,0.15), transparent 50%),
    radial-gradient(at 0% 100%, rgba(249,115,22,0.15), transparent 50%);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* ---------------- ANIMACIÓN DEL LOGO DE CARGA ---------------- */
@keyframes fillUp {
  0% { height: 0%; }
  100% { height: 100%; }
}

.loading-logo-container {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 1rem auto;
}

.loading-logo-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  filter: grayscale(100%);
}

.loading-logo-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  animation: fillUp 1.5s ease-in-out infinite alternate;
}

.loading-logo-mask svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 96px;
  height: 96px;
}

/* TOAST ANIMATION */
@keyframes slideUpFade {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-toast {
  animation: slideUpFade 0.3s ease-out forwards;
}

/* ---------------- MODO OSCURO (INYECCIÓN SEGURA) ---------------- */
.dark-theme {
  background-color: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
}
.dark-theme .bg-mesh {
  background: radial-gradient(at 0% 0%, rgba(37,99,235,0.1), transparent 50%),
              radial-gradient(at 100% 0%, rgba(249,115,22,0.05), transparent 50%);
}
.dark-theme .glass-panel {
  background: rgba(30, 41, 59, 0.7) !important;
  border-color: rgba(255,255,255,0.05) !important;
}
.dark-theme .text-slate-800 { color: #f8fafc !important; }
.dark-theme .text-slate-700 { color: #e2e8f0 !important; }
.dark-theme .text-slate-600 { color: #cbd5e1 !important; }
.dark-theme .text-slate-500 { color: #94a3b8 !important; }
.dark-theme .text-slate-400 { color: #64748b !important; }

.dark-theme .bg-white { background-color: #1e293b !important; }
.dark-theme .bg-white\\/50 { background-color: rgba(30, 41, 59, 0.5) !important; }
.dark-theme .bg-white\\/95 { background-color: rgba(30, 41, 59, 0.95) !important; } 
.dark-theme .bg-slate-50 { background-color: #0f172a !important; }
.dark-theme .bg-slate-50\\/80 { background-color: rgba(15, 23, 42, 0.8) !important; }
.dark-theme .bg-slate-100 { background-color: #1e293b !important; }
.dark-theme .bg-slate-200\\/50 { background-color: rgba(51, 65, 85, 0.5) !important; }

.dark-theme .border-slate-200 { border-color: #334155 !important; }
.dark-theme .border-slate-100 { border-color: #1e293b !important; }

.dark-theme .hover\\:bg-blue-50:hover { background-color: rgba(51, 65, 85, 0.6) !important; color: #93c5fd !important; }
.dark-theme .hover\\:text-blue-700:hover { color: #93c5fd !important; }
.dark-theme .hover\\:bg-rose-50:hover { background-color: rgba(159, 18, 57, 0.3) !important; color: #fda4af !important; }

/* FONDOS CONDICIONALES TRANSACCIONES MODO OSCURO */
.dark-theme .bg-emerald-50 { background-color: rgba(16, 185, 129, 0.1) !important; border-color: rgba(16, 185, 129, 0.2) !important; }
.dark-theme .bg-rose-50 { background-color: rgba(225, 29, 72, 0.1) !important; border-color: rgba(225, 29, 72, 0.2) !important; }
.dark-theme .bg-amber-50 { background-color: rgba(245, 158, 11, 0.1) !important; border-color: rgba(245, 158, 11, 0.2) !important; }

.dark-theme input, .dark-theme select { 
  background-color: #334155 !important; 
  color: #f8fafc !important; 
  border-color: #475569 !important;
}
.dark-theme select option { background-color: #1e293b !important; color: #f8fafc !important; }

@media print { .no-print { display: none !important; } }
`;

/* ---------------- DICCIONARIOS DE IDIOMAS (i18n) ---------------- */
const translations = {
  es: {
    welcome: "Bienvenido a Micapp", setupSubtitle: "Selecciona tus preferencias para empezar",
    firstName: "Nombre", lastName: "Apellido", email: "Correo Electrónico", phone: "Teléfono",
    language: "Idioma", currency: "Moneda", startApp: "Entrar con Google",
    greeting: "Hola",
    balance: "Balance", income: "Ingresos", expenses: "Egresos",
    savingsGoal: "Meta Ahorro", progress: "Progreso", savedSoFar: "Llevas ahorrado",
    breakPiggy: "Romper cochino", goalReached: "🎉 ¡Lo lograste! 🎉",
    confirmBreakTitle: "Romper Cochino", confirmBreakMsg: "Ingresa el monto que deseas retirar de tus ahorros. Este dinero se sumará a tu balance disponible.",
    withdrawAmount: "Monto a retirar", withdrawError: "Monto inválido o superior al ahorro",
    piggyBroken: "¡Ahorros retirados! Dinero añadido al balance.", piggyBreakConcept: "Ahorros retirados",
    newRecord: "Nuevo Registro", editRecord: "Editar Registro", expenseType: "Gasto", incomeType: "Ingreso",
    concept: "Concepto", conceptPlaceholder: "Ej. Compra de supermercado",
    amount: "Monto", date: "Fecha", category: "Categoría", saveBtn: "Guardar", updateBtn: "Actualizar",
    distribution: "Distribución de Gastos", noExpenses: "No hay gastos registrados este mes.",
    transactions: "Movimientos del Mes", noTransactions: "No hay movimientos en este periodo.", action: "Acción",
    financialReport: "Reporte de Movimientos", period: "Periodo", totalIncome: "Total Ingresos",
    totalExpenses: "Total Egresos", netBalance: "Balance Neto",
    investmentTip: "Consejo de Inversión Inteligente", unnecessaryExpenses: "Gastos Innecesarios",
    tip0: "🟢 No se registran gastos innecesarios en este periodo.\n\nMantener este comportamiento favorece el ahorro y la estabilidad financiera.",
    tip50: "🟡 Se identifican gastos innecesarios de bajo monto.\n\nReducirlos puede mejorar el control financiero a largo plazo.",
    tip200: "🟡 Se observan gastos innecesarios moderados.\n\nEste monto podría destinarse a ahorro o inversión básica.",
    tip500: "🟠 El nivel de gastos innecesarios es significativo.\n\nSe recomienda revisar hábitos de consumo y priorizar objetivos financieros.",
    tip1000: "🔴 Los gastos innecesarios representan una parte importante del presupuesto.\n\nRedirigir este monto puede generar mejoras financieras relevantes.",
    tip3000: "🔴 Se detecta un nivel elevado de gastos innecesarios.\n\nOptimizar este comportamiento puede impactar de forma directa en la capacidad de ahorro.",
    tipMax: "🔥 El volumen de gastos innecesarios es alto.\n\nUna mejor gestión de estos recursos puede contribuir a la construcción de capital.",
    menu: "Menú", annualReport: "Reporte Anual", downloadTransactions: "Descargar Movimientos",
    editProfile: "Editar Datos Personales", saveChanges: "Guardar Cambios", cancel: "Cancelar", close: "Cerrar",
    annualSummaryTitle: "Resumen Anual", year: "Año", optional: "(Opcional)", logout: "Cerrar Sesión",
    theme: "Tema", lightMode: "Claro", darkMode: "Oscuro",
    downloadPDFTitle: "Opciones de Reporte", timeRange: "Periodo a descargar",
    last7days: "Últimos 7 días", last15days: "Últimos 15 días", last30days: "Últimos 30 días",
    last90days: "Últimos 90 dias", allTime: "Todo el historial", generatePDF: "Generar PDF",
    budgets: "Presupuestos por Categoría", budgetExceeded: "Presupuesto excedido",
    spentMore: "más que el mes pasado", spentLess: "menos que el mes pasado", noLimit: "Sin límite",
    errorLogin: "Error al iniciar sesión. Intenta de nuevo.",
    errorSave: "Error al sincronizar con la nube.",
    errorPDF: "Hubo un problema al generar el PDF.",
    successProfile: "Perfil actualizado correctamente.",
    successSave: "Registro guardado.",
    successUpdate: "Registro actualizado.",
    successDelete: "Registro eliminado.",
    termsAcceptance: "Acepto los",
    termsLink: "Términos y Condiciones",
    notif48h: "Es hora de poner tus finanzas en control",
    notifMid: "Tu control financiero está estable",
    notifEnd: "Cerraste el mes con buen control",
    notifUp: "Estás gastando más que el mes pasado",
    confirmDeleteTitle: "Eliminar Registro",
    confirmDeleteMsg: "¿Estás seguro que deseas eliminar este movimiento?",
    confirm: "Sí, eliminar"
  },
  en: {
    welcome: "Welcome to Micapp", setupSubtitle: "Select your preferences to start",
    firstName: "First Name", lastName: "Last Name", email: "Email", phone: "Phone",
    language: "Language", currency: "Currency", startApp: "Sign in with Google",
    greeting: "Hello",
    balance: "Balance", income: "Income", expenses: "Expenses",
    savingsGoal: "Savings Goal", progress: "Progress", savedSoFar: "Saved so far",
    breakPiggy: "Break Piggy Bank", goalReached: "🎉 Goal Reached! 🎉",
    confirmBreakTitle: "Break Piggy Bank", confirmBreakMsg: "Enter the amount you wish to withdraw from your savings. This money will be added to your available balance.",
    withdrawAmount: "Amount to withdraw", withdrawError: "Invalid amount or exceeds savings",
    piggyBroken: "Savings withdrawn! Money added to balance.", piggyBreakConcept: "Savings withdrawn",
    newRecord: "New Record", editRecord: "Edit Record", expenseType: "Expense", incomeType: "Income",
    concept: "Description", conceptPlaceholder: "E.g. Groceries",
    amount: "Amount", date: "Date", category: "Category", saveBtn: "Save", updateBtn: "Update",
    distribution: "Expenses Distribution", noExpenses: "No expenses recorded this month.",
    transactions: "Monthly Transactions", noTransactions: "No transactions in this period.", action: "Action",
    financialReport: "Transactions Report", period: "Period", totalIncome: "Total Income",
    totalExpenses: "Total Expenses", netBalance: "Net Balance",
    investmentTip: "Smart Investment Tip", unnecessaryExpenses: "Unnecessary Expenses",
    tip0: "🟢 No unnecessary expenses recorded this period.\n\nMaintaining this behavior favors savings and financial stability.",
    tip50: "🟡 Low amount of unnecessary expenses identified.\n\nReducing them can improve long-term financial control.",
    tip200: "🟡 Moderate unnecessary expenses observed.\n\nThis amount could be allocated to savings or basic investment.",
    tip500: "🟠 Significant level of unnecessary expenses.\n\nIt is recommended to review consumption habits and prioritize financial goals.",
    tip1000: "🔴 Unnecessary expenses represent an important part of the budget.\n\nRedirecting this amount can generate relevant financial improvements.",
    tip3000: "🔴 High level of unnecessary expenses detected.\n\nOptimizing this behavior can directly impact savings capacity.",
    tipMax: "🔥 High volume of unnecessary expenses.\n\nBetter management of these resources can contribute to capital building.",
    menu: "Menu", annualReport: "Annual Report", downloadTransactions: "Download Transactions",
    editProfile: "Edit Personal Data", saveChanges: "Save Changes", cancel: "Cancel", close: "Close",
    annualSummaryTitle: "Annual Summary", year: "Year", optional: "(Optional)", logout: "Log Out",
    theme: "Theme", lightMode: "Light", darkMode: "Dark",
    downloadPDFTitle: "Report Options", timeRange: "Time Range",
    last7days: "Last 7 days", last15days: "Last 15 days", last30days: "Last 30 days",
    last90days: "Last 90 days", allTime: "All time", generatePDF: "Generate PDF",
    budgets: "Category Budgets", budgetExceeded: "Budget exceeded",
    spentMore: "more than last month", spentLess: "less than last month", noLimit: "No limit",
    errorLogin: "Login failed. Please try again.",
    errorSave: "Error syncing with cloud.",
    errorPDF: "There was a problem generating the PDF.",
    successProfile: "Profile updated successfully.",
    successSave: "Record saved.",
    successUpdate: "Record updated.",
    successDelete: "Record deleted.",
    termsAcceptance: "I accept the",
    termsLink: "Terms and Conditions",
    notif48h: "It's time to put your finances in control",
    notifMid: "Your financial control is stable",
    notifEnd: "You closed the month with good control",
    notifUp: "You are spending more than last month",
    confirmDeleteTitle: "Delete Record",
    confirmDeleteMsg: "Are you sure you want to delete this transaction?",
    confirm: "Yes, delete"
  },
  pt: {
    welcome: "Bem-vindo ao Micapp", setupSubtitle: "Selecione suas preferências para começar",
    firstName: "Nome", lastName: "Sobrenome", email: "E-mail", phone: "Telefone",
    language: "Idioma", currency: "Moeda", startApp: "Entrar com o Google",
    greeting: "Olá",
    balance: "Saldo", income: "Receitas", expenses: "Despesas",
    savingsGoal: "Meta de Economia", progress: "Progresso", savedSoFar: "Você economizou",
    breakPiggy: "Quebrar cofrinho", goalReached: "🎉 Você conseguiu! 🎉",
    confirmBreakTitle: "Retirar Poupança", confirmBreakMsg: "Insira o valor que deseja retirar de suas economias. Este dinheiro será adicionado ao seu saldo disponível.",
    withdrawAmount: "Valor a retirar", withdrawError: "Valor inválido ou superior à poupança",
    piggyBroken: "Poupança retirada! Dinheiro adicionado ao saldo.", piggyBreakConcept: "Poupança retirada",
    newRecord: "Novo Registro", editRecord: "Editar Registro", expenseType: "Despesa", incomeType: "Receita",
    concept: "Descrição", conceptPlaceholder: "Ex. Supermercado",
    amount: "Valor", date: "Data", category: "Categoria", saveBtn: "Salvar", updateBtn: "Atualizar",
    distribution: "Distribuição de Despesas", noExpenses: "Nenhuma despesa registrada este mês.",
    transactions: "Transações do Mês", noTransactions: "Nenhuma transação neste período.", action: "Ação",
    financialReport: "Relatório de Transações", period: "Período", totalIncome: "Total de Receitas",
    totalExpenses: "Total de Despesas", netBalance: "Saldo Líquido",
    investmentTip: "Dica de Investimento Inteligente", unnecessaryExpenses: "Despesas Desnecessárias",
    tip0: "🟢 Nenhuma despesa desnecessária registrada neste período.\n\nManter esse comportamento favorece a poupança e a estabilidade financeira.",
    tip50: "🟡 Baixo valor de despesas desnecessárias identificado.\n\nReduzi-las pode melhorar o controle financeiro a longo prazo.",
    tip200: "🟡 Despesas desnecessárias moderadas observadas.\n\nEsse valor poderia ser destinado a poupança ou investimento básico.",
    tip500: "🟠 Nível significativo de despesas desnecessárias.\n\nRecomenda-se rever hábitos de consumo e priorizar objetivos financeiros.",
    tip1000: "🔴 As despesas desnecessárias representam uma parte importante do orçamento.\n\nRedirecionar esse valor pode gerar melhorias financeiras relevantes.",
    tip3000: "🔴 Elevado nível de despesas desnecessárias detectado.\n\nOtimizar esse comportamento pode impactar diretamente a capacidade de poupança.",
    tipMax: "🔥 Alto volume de despesas desnecessárias.\n\nUma melhor gestão desses recursos pode contribuir para a construção de capital.",
    menu: "Menu", annualReport: "Relatório Anual", downloadTransactions: "Baixar Transações",
    editProfile: "Editar Dados Pessoais", saveChanges: "Salvar Alterações", cancel: "Cancelar", close: "Fechar",
    annualSummaryTitle: "Resumo Anual", year: "Ano", optional: "(Opcional)", logout: "Sair",
    theme: "Tema", lightMode: "Claro", darkMode: "Escuro",
    downloadPDFTitle: "Opções de Relatório", timeRange: "Período para baixar",
    last7days: "Últimos 7 dias", last15days: "Últimos 15 dias", last30days: "Últimos 30 dias",
    last90days: "Últimos 90 dias", allTime: "Todo o histórico", generatePDF: "Gerar PDF",
    budgets: "Orçamentos por Categoria", budgetExceeded: "Orçamento excedido",
    spentMore: "a mais que o mês pasado", spentLess: "a menos que o mês pasado", noLimit: "Sem limite",
    errorLogin: "Erro ao iniciar sessão. Tente novamente.",
    errorSave: "Erro ao sincronizar com a nuvem.",
    errorPDF: "Ocorreu um problema ao gerar o PDF.",
    successProfile: "Perfil atualizado com sucesso.",
    successSave: "Registro salvo.",
    successUpdate: "Registro atualizado.",
    successDelete: "Registro excluído.",
    termsAcceptance: "Eu aceito os",
    termsLink: "Termos e Condições",
    notif48h: "É hora de colocar suas finanças sob controle",
    notifMid: "Seu controle financeiro está estável",
    notifEnd: "Você fechou o mês com bom controle",
    notifUp: "Você está gastando mais do que no mês passado",
    confirmDeleteTitle: "Excluir Registro",
    confirmDeleteMsg: "Tem certeza de que deseja excluir esta transação?",
    confirm: "Sim, excluir"
  }
};

const translateCategory = (cat, lang) => {
  const dict = {
    es: cat,
    en: {
      'Servicios': 'Utilities', 'Hogar': 'Home', 'Alimentación': 'Food', 'Hijos': 'Children', 'Transporte': 'Transport',
      'Entretenimiento': 'Entertainment', 'Educación': 'Education', 'Deudas': 'Debts', 'Gastos Innecesarios': 'Unnecessary Expenses',
      'Ahorro': 'Savings',
      'Salario': 'Salary', 'Negocio': 'Business', 'Inversiones': 'Investments', 'Otros': 'Other'
    }[cat] || cat,
    pt: {
      'Servicios': 'Serviços', 'Hogar': 'Lar', 'Alimentación': 'Alimentação', 'Hijos': 'Filhos', 'Transporte': 'Transporte',
      'Entretenimiento': 'Entretenimento', 'Educación': 'Educação', 'Deudas': 'Dívidas', 'Gastos Innecesarios': 'Gastos Desnecessários',
      'Ahorro': 'Poupança',
      'Salario': 'Salário', 'Negocio': 'Negócio', 'Inversiones': 'Investimentos', 'Otros': 'Outros'
    }[cat] || cat
  };
  return dict[lang] || cat; 
};

/* ---------------- DATOS CONSTANTES ---------------- */
const CATEGORIAS_EGRESO = ['Servicios', 'Hogar', 'Alimentación', 'Hijos', 'Transporte', 'Entretenimiento', 'Educación', 'Deudas', 'Gastos Innecesarios', 'Ahorro'];
const CATEGORIAS_INGRESO = ['Salario', 'Negocio', 'Inversiones', 'Otros'];
const COLORES_CATEGORIAS = {
  Servicios: '#3b82f6', Hogar: '#14b8a6', Alimentación: '#10b981', Hijos: '#f59e0b', Transporte: '#6366f1',
  Entretenimiento: '#8b5cf6', Educación: '#ec4899', Deudas: '#ef4444', 'Gastos Innecesarios': '#f97316',
  Ahorro: '#0ea5e9', 
  Salario: '#22c55e', Negocio: '#0ea5e9', Inversiones: '#8b5cf6', Otros: '#64748b'
};

const DATOS_EJEMPLO = [];
const RAW_SVG_LOGO = `<svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 1000"><defs><linearGradient id="Degradado_sin_nombre_7" data-name="Degradado sin nombre 7" x1="77.23" y1="488.48" x2="901.64" y2="488.48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4bd400"/><stop offset="1" stop-color="#f0ff15"/></linearGradient></defs><path d="m217.11,723.75c0,19.34-6.56,35.56-19.66,48.66-13.11,13.11-29.33,19.66-48.66,19.66-9.46,0-18.48-1.82-27.07-5.48-8.6-3.65-16.22-8.48-22.88-14.51-6.66-6.01-11.92-13.21-15.79-21.59-3.87-8.38-5.8-17.29-5.8-26.75v-303.59c0-32.23,6.34-62.63,19.01-91.21,12.67-28.57,29.97-53.5,51.89-74.77,21.92-21.27,47.38-38.13,76.38-50.6,29.01-12.46,59.62-18.69,91.85-18.69s64.99,6.45,94.43,19.34c29.43,12.89,55.32,30.52,77.67,52.86,22.34-22.34,48.44-39.96,78.31-52.86,29.86-12.89,61.56-19.34,95.08-19.34s63.17,6.02,91.53,18.05c28.36,12.04,53.28,28.58,74.77,49.63,21.48,21.06,38.68,45.55,51.57,73.48,12.89,27.94,19.98,57.8,21.27,89.6,0,.87.1,1.83.32,2.9.21,1.08.32,2.05.32,2.9v302.3c0,9.46-1.83,18.37-5.48,26.75-3.66,8.38-8.6,15.58-14.83,21.59-6.23,6.02-13.44,10.86-21.59,14.51-8.17,3.66-16.98,5.48-26.43,5.48s-18.59-1.82-27.39-5.48c-8.82-3.65-16.44-8.48-22.89-14.51-6.45-6.01-11.6-13.21-15.47-21.59-3.87-8.38-5.8-17.29-5.8-26.75v-304.24c-.44-13.75-3.44-26.43-9.02-38.03-5.59-11.6-13-21.59-22.24-29.97-9.25-8.38-19.77-14.93-31.58-19.66-11.83-4.72-24.61-7.09-38.35-7.09s-26.86,2.58-39.32,7.73c-12.47,5.16-23.32,12.15-32.55,20.95-9.25,8.81-16.55,19.13-21.92,30.94-5.38,11.83-8.06,24.6-8.06,38.35v301.02c0,19.34-6.56,35.56-19.66,48.66-13.11,13.11-29.33,19.66-48.67,19.66-9.46,0-18.48-1.82-27.07-5.48-8.6-3.65-16.23-8.48-22.88-14.51-6.67-6.01-11.93-13.21-15.79-21.59-3.87-8.38-5.8-17.29-5.8-26.75v-303.59c-.43-13.75-3.33-26.53-8.7-38.35-5.38-11.81-12.57-21.92-21.59-30.3-9.03-8.38-19.56-14.93-31.58-19.66-12.04-4.72-24.93-7.09-38.68-7.09s-26.75,2.48-39,7.41c-12.25,4.94-22.99,11.82-32.23,20.63-9.25,8.81-16.55,19.01-21.92,30.62-5.38,11.6-8.06,24.07-8.06,37.38v302.95Z" fill="url(#Degradado_sin_nombre_7)" strokeWidth="0"/>
</svg>`;

const GoogleLogo = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2 shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
  </svg>
);

const CustomLogo = ({ className = "" }) => (
  <img 
    src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(RAW_SVG_LOGO)))}`} 
    className={className} 
    alt="Micapp Logo" 
  />
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-panel p-5 sm:p-6 rounded-3xl ${className}`}>
    {children}
  </div>
);

// Helpers de conversión simplificados (asumen relación 1:1 local, actualízalo a tu lógica)
const convertToUSD = (amountLocal) => amountLocal;
const convertFromUSD = (amountUSD) => amountUSD;

/* ---------------- APP ---------------- */
export default function App() {
  /* ---------- ESTADOS DE FIREBASE ---------- */
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  /* ---------- ESTADOS PERFIL ---------- */
  const [profile, setProfile] = useState({
    isConfigured: false, firstName: '', lastName: '', email: '', phone: '', language: 'es', currency: 'USD', theme: 'light'
  });

  /* ---------- ESTADOS FINANZAS & UI ---------- */
  const [transactions, setTransactions] = useState([]); 
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  
  const [metaAhorro, setMetaAhorro] = useState(0); 
  const [budgets, setBudgets] = useState({});
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState("");
  const [breakAmount, setBreakAmount] = useState(""); 
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [tempProfile, setTempProfile] = useState(profile);
  const [pdfRange, setPdfRange] = useState('30'); 
  
  const [showAmounts, setShowAmounts] = useState(true); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [formData, setFormData] = useState({
    type: 'egreso', amount: '', category: CATEGORIAS_EGRESO[0], date: new Date().toISOString().split('T')[0], concept: ''
  });

  const [tempPreLoginLang, setTempPreLoginLang] = useState('es');
  const [tempPreLoginCurr, setTempPreLoginCurr] = useState('USD');

  /* ---------- ESTADOS DE TASAS DE CAMBIO ---------- */
  const [exchangeRates, setExchangeRates] = useState(null);
  const [ratesError, setRatesError] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = profile?.theme === 'dark' ? '#0f172a' : '#f8fafc';
  }, [profile?.theme]);

  /* ---------- API DE CAMBIO DE MONEDA ---------- */
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('https://api.frankfurter.app/latest?from=USD', { timeout: 3000 });
        if (response.data && response.data.rates) {
          setExchangeRates({ USD: 1, ...response.data.rates });
        } else {
          throw new Error("Respuesta inválida");
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setRatesError(true);
        setExchangeRates({ USD: 1, BRL: 5.05, EUR: 0.92, MXN: 16.8 });
      } finally {
        setIsCheckingAuth(false); 
      }
    };
    fetchRates();
  }, []);

  /* ---------- AYUDANTES ---------- */
  const currentLang = profile?.isConfigured ? profile.language : tempPreLoginLang;
  const currentCurrency = profile?.isConfigured ? profile.currency : tempPreLoginCurr;
  const t = (key) => (translations[currentLang] && translations[currentLang][key]) || key;

  // Formateador de moneda optimizado: Responde al idioma y moneda seleccionada
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currentLang === 'es' ? 'es-ES' : currentLang === 'pt' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: profile?.isConfigured ? profile.currency : tempPreLoginCurr,
    }).format(amount);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const renderAmount = (val) => {
    return showAmounts ? formatCurrency(val) : '••••';
  };

  /* ---------- PERSISTENCIA EN LA NUBE ---------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthUser(currentUser);
      
      if (currentUser) {
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.transactions) setTransactions(data.transactions);
          if (data.metaAhorro !== undefined) setMetaAhorro(data.metaAhorro);
          if (data.budgets) setBudgets(data.budgets); 
          if (data.profile) setProfile({ ...data.profile, isConfigured: true });
        } else {
          const nombreCompleto = currentUser.displayName || "";
          const [nombre, ...apellido] = nombreCompleto.split(" ");
          
          const nuevoPerfil = {
            isConfigured: true,
            firstName: nombre,
            lastName: apellido.join(" "),
            email: currentUser.email,
            phone: '',
            language: tempPreLoginLang,
            currency: tempPreLoginCurr,
            theme: 'light'
          };

          setProfile(nuevoPerfil);
          setTransactions(DATOS_EJEMPLO); 
          setMetaAhorro(0); 
          setShowTutorial(true); 
          
          setDoc(docRef, {
            profile: nuevoPerfil,
            transactions: DATOS_EJEMPLO,
            metaAhorro: 0,
            budgets: {}
          }).catch(err => {
             console.error("Error inicializando nube:", err);
             showToast(t('errorSave') || "Error de red", 'error');
          });
        }
        setIsAuthReady(true);
      } else {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []); // <-- Array vacío optimizado para evitar re-suscripciones y fuga de memoria

  useEffect(() => {
    if (!authUser || !profile.isConfigured || isCheckingAuth) return;
    
    // Optimizador: Debounce para evitar sobrecargar la Base de Datos con lecturas instantáneas
    const timeoutId = setTimeout(() => {
      const docRef = doc(db, "usuarios", authUser.uid);
      setDoc(docRef, {
        transactions,
        metaAhorro,
        budgets, 
        profile
      }, { merge: true }).catch(err => {
         console.error("Error guardando en la nube:", err);
         showToast(t('errorSave') || "Error de red", 'error');
      });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [transactions, metaAhorro, budgets, profile, authUser, isCheckingAuth]);

  /* ---------- FUNCIONES DE AUTENTICACIÓN ---------- */
  const loginConGoogle = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.credential.idToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showToast(t('errorLogin') || "Error al iniciar sesión", 'error');
    }
  };

  const cerrarSesion = async () => {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
    signOut(auth);
    setProfile({ isConfigured: false, firstName: '', lastName: '', email: '', phone: '', language: 'es', currency: 'USD', theme: 'light' });
    setTransactions([]);
    setBudgets({});
    setIsMenuOpen(false);
  };
  
  /* ---------- PROCESAMIENTO DE DATOS ---------- */
  const balanceHistorico = useMemo(() => {
    const transaccionesPasadas = transactions.filter(tr => {
      const d = new Date(tr.date);
      const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      
      if (adjustedDate.getFullYear() < anioActual) return true;
      if (adjustedDate.getFullYear() === anioActual && adjustedDate.getMonth() <= mesActual) return true;
      return false;
    });

    const inTot = transaccionesPasadas.filter(tr => tr.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
    const outTot = transaccionesPasadas.filter(tr => tr.type === 'egreso').reduce((a, b) => a + b.amount, 0);
    return inTot - outTot;
  }, [transactions, mesActual, anioActual]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(tr => {
      const d = new Date(tr.date);
      const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return adjustedDate.getMonth() === mesActual && adjustedDate.getFullYear() === anioActual;
    });
  }, [transactions, mesActual, anioActual]);

  const stats = useMemo(() => {
    const ingresos = currentMonthTransactions.filter(tr => tr.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
    const egresos = currentMonthTransactions.filter(tr => tr.type === 'egreso').reduce((a, b) => a + b.amount, 0);
    const innecesarios = currentMonthTransactions.filter(tr => tr.category === 'Gastos Innecesarios').reduce((a, b) => a + b.amount, 0);
    return { ingresos, egresos, balance: ingresos - egresos, innecesarios };
  }, [currentMonthTransactions]);

  const comparisonStats = useMemo(() => {
    let prevMonth = mesActual - 1;
    let prevYear = anioActual;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    const prevMonthTxs = transactions.filter(tr => {
      const d = new Date(tr.date);
      const adj = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return adj.getMonth() === prevMonth && adj.getFullYear() === prevYear;
    });

    const prevExpenses = prevMonthTxs.filter(t => t.type === 'egreso').reduce((a,b) => a + b.amount, 0);
    const currentExpenses = stats.egresos;

    let diff = 0;
    if (prevExpenses === 0 && currentExpenses > 0) diff = 100;
    else if (prevExpenses > 0) diff = ((currentExpenses - prevExpenses) / prevExpenses) * 100;

    return { diff, prevExpenses };
  }, [transactions, mesActual, anioActual, stats.egresos]);

  const annualStats = useMemo(() => {
    const annualTxs = transactions.filter(tr => {
      const d = new Date(tr.date);
      const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return adjustedDate.getFullYear() === anioActual;
    });
    const ingresos = annualTxs.filter(tr => tr.type === 'ingreso').reduce((a, b) => a + b.amount, 0);
    const egresos = annualTxs.filter(tr => tr.type === 'egreso').reduce((a, b) => a + b.amount, 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  }, [transactions, anioActual]);

  const totalAhorrado = useMemo(() => {
    return transactions.reduce((sum, tr) => {
      if (tr.category === 'Ahorro') {
        return tr.type === 'egreso' ? sum + tr.amount : sum - tr.amount;
      }
      return sum;
    }, 0);
  }, [transactions]);

  const progresoAhorro = useMemo(() => {
    if (metaAhorro === 0) return 0;
    return Math.max(0, Math.min(100, (totalAhorrado / metaAhorro) * 100));
  }, [totalAhorrado, metaAhorro]);

  const gastosPorCategoria = useMemo(() => {
    const gastos = currentMonthTransactions.filter(tr => tr.type === 'egreso');
    const agrupados = gastos.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount; 
      return acc;
    }, {});
    return Object.keys(agrupados).map(key => ({
      name: key, value: agrupados[key], color: COLORES_CATEGORIAS[key] || '#cbd5e1'
    })).sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  const REGLAS_INVERSION_USD = [
    { max: 0, texto: t('tip0') },
    { max: 50, texto: t('tip50') },   
    { max: 200, texto: t('tip200') },  
    { max: 500, texto: t('tip500') }, 
    { max: 1000, texto: t('tip1000') }, 
    { max: 3000, texto: t('tip3000') }, 
    { max: Infinity, texto: t('tipMax') }
  ];

  const obtenerSugerenciaInversion = (montoInnecesarioUSD) => {
    const regla = REGLAS_INVERSION_USD.find(r => montoInnecesarioUSD <= r.max);
    return regla ? regla.texto : "";
  };

  /* ---------- ENGINE DE NOTIFICACIONES (TOASTS) ---------- */
  useEffect(() => {
    if (!profile.isConfigured || transactions.length === 0) return;

    const today = new Date();
    const currentDay = today.getDate();
    
    const lastTxId = transactions.reduce((max, t) => t.id > max ? t.id : max, 0);
    const hoursSinceLastTx = (Date.now() - lastTxId) / (1000 * 60 * 60);

    if (hoursSinceLastTx > 48 && !sessionStorage.getItem('notif_48h')) {
      showToast(t('notif48h'), 'info');
      sessionStorage.setItem('notif_48h', 'true');
    } 
    else if (currentDay >= 14 && currentDay <= 16 && !sessionStorage.getItem('notif_mid')) {
      showToast(t('notifMid'), 'info');
      sessionStorage.setItem('notif_mid', 'true');
    } 
    else if (currentDay >= 28 && !sessionStorage.getItem('notif_end')) {
      showToast(t('notifEnd'), 'info');
      sessionStorage.setItem('notif_end', 'true');
    } 
    else if (comparisonStats.diff > 0 && !sessionStorage.getItem('notif_up')) {
      showToast(t('notifUp'), 'info');
      sessionStorage.setItem('notif_up', 'true');
    }
  }, [transactions, profile.isConfigured, comparisonStats.diff]);

  const mesesTraduccion = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  };

  /* ---------- HANDLERS ---------- */
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfile(tempProfile);
    setActiveModal(null);
    showToast(t('successProfile') || "Perfil actualizado", 'success');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'type') newData.category = value === 'ingreso' ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0];
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.concept || !formData.date) return;
    
    const amountUSD = convertToUSD(Number(formData.amount));
    
    if (editingTransactionId) {
      setTransactions(prev => {
        const nuevos = prev.map(tr => 
          tr.id === editingTransactionId 
            ? { ...formData, id: tr.id, amount: amountUSD, createdAt: tr.createdAt } 
            : tr
        );
        return [...nuevos]; 
      });
      setEditingTransactionId(null);
      showToast(t('successUpdate') || "Actualizado exitosamente", 'success');
    } else {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const newTransaction = { ...formData, id: Date.now(), amount: amountUSD, createdAt: timeString };
      
      setTransactions(prev => [...[newTransaction, ...prev]]); 

      if ((transactions.length + 1) % 5 === 0) {
        showToast("Reporte actualizado, descarga tu PDF ahora", 'warning');
      } else {
        showToast(t('successSave') || "Guardado exitosamente", 'success');
      }
    }
    
    setFormData({ ...formData, amount: '', concept: '' });
  };

  const iniciarEdicionTransaccion = (tr) => {
    const amountLocal = convertFromUSD(tr.amount).toFixed(2);
    setFormData({
      type: tr.type,
      amount: amountLocal,
      category: tr.category,
      date: tr.date,
      concept: tr.concept
    });
    setEditingTransactionId(tr.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditingTransactionId(null);
    setFormData({
      type: 'egreso', amount: '', category: CATEGORIAS_EGRESO[0], date: new Date().toISOString().split('T')[0], concept: ''
    });
  };

  const confirmDelete = () => {
    if (!transactionToDelete) return;
    setTransactions(prev => {
      const remaining = prev.filter(tr => tr.id !== transactionToDelete);
      return [...remaining]; 
    });
    if (editingTransactionId === transactionToDelete) cancelarEdicion();
    showToast(t('successDelete') || "Eliminado exitosamente", 'success');
    setTransactionToDelete(null);
  };

  const handleSaveMeta = () => {
    const newValLocal = Number(tempMeta);
    if (!isNaN(newValLocal) && newValLocal >= 0) {
      setMetaAhorro(convertToUSD(newValLocal));
    }
    setIsEditingMeta(false);
  };

  const openMenuModal = (modalName) => {
    if (modalName === 'editProfile') setTempProfile(profile);
    setActiveModal(modalName);
    setIsMenuOpen(false);
  };

  const iniciarEdicionMeta = () => {
    const localValue = convertFromUSD(metaAhorro).toFixed(2);
    setTempMeta(localValue);
    setIsEditingMeta(true);
  };

  const handleBudgetChange = (cat, valueLocal) => {
    if (valueLocal === "") {
      const newB = { ...budgets };
      delete newB[cat];
      setBudgets({ ...newB });
      return;
    }
    const val = parseFloat(valueLocal);
    if (!isNaN(val) && val >= 0) {
      setBudgets(prev => ({ ...prev, [cat]: convertToUSD(val) }));
    } 
  };

  const confirmBreakPiggy = (e) => {
    e.preventDefault();
    if (totalAhorrado <= 0) return;
    
    const amountToWithdrawLocal = parseFloat(breakAmount);
    if (isNaN(amountToWithdrawLocal) || amountToWithdrawLocal <= 0) {
      showToast(t('withdrawError'), 'error');
      return;
    }

    const amountToWithdrawUSD = convertToUSD(amountToWithdrawLocal);

    if (amountToWithdrawUSD > totalAhorrado + 0.01) {
      showToast(t('withdrawError'), 'error');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toISOString().split('T')[0];

    const newTransaction = {
      id: Date.now(),
      type: 'ingreso', 
      amount: Math.min(amountToWithdrawUSD, totalAhorrado), 
      category: 'Ahorro',
      date: dateString,
      concept: t('piggyBreakConcept'),
      createdAt: timeString
    };

    setTransactions(prev => [...[newTransaction, ...prev]]);
    showToast(t('piggyBroken'), 'success');
    setActiveModal(null);
    setBreakAmount("");
  };

  /* ---------- GENERADOR DE PDF AVANZADO ASÍNCRONO ---------- */
  const generarPDF = async (e) => {
    e.preventDefault();
    try {
      const doc = new jsPDF();
      const tableColumn = [t('date'), t('concept'), t('category'), t('amount')];
      const tableRows = [];

      const now = new Date();
      let movimientosPDF = [];

      if (pdfRange === 'all') {
        movimientosPDF = [...transactions];
      } else {
        const days = parseInt(pdfRange);
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        movimientosPDF = transactions.filter(tr => {
          const d = new Date(tr.date);
          const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
          return adjustedDate >= cutoffDate;
        });
      }

      movimientosPDF.sort((a,b) => new Date(b.date) - new Date(a.date));

      let inTot = 0, outTot = 0;

      movimientosPDF.forEach(tr => {
        if (tr.type === 'ingreso') inTot += tr.amount;
        else outTot += tr.amount;

        const isAhorro = tr.category === 'Ahorro';
        const isIngreso = tr.type === 'ingreso';

        const rowData = [
          `${tr.date.split('-').reverse().join('/')}${tr.createdAt ? ` ${tr.createdAt}` : ''}`,
          tr.concept,
          translateCategory(tr.category, currentLang),
          {
            content: `${isIngreso ? '+' : '-'}${formatCurrency(tr.amount)}`, 
            styles: {
              fillColor: isAhorro ? [254, 252, 232] : isIngreso ? [240, 253, 244] : [255, 241, 242],
              textColor: isAhorro ? [161, 98, 7] : isIngreso ? [21, 128, 61] : [225, 29, 72],
              fontStyle: 'bold',
              halign: 'right'
            }
          }
        ];
        tableRows.push(rowData);
      });

      const balTot = inTot - outTot;

      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 500;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 500, 500);
            const pngData = canvas.toDataURL('image/png');
            
            doc.addImage(pngData, 'PNG', 14, 10, 10, 10);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'bold');
            doc.text("Micapp", 14, 25);
            resolve();
        };
        img.onerror = () => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Micapp", 14, 15);
            resolve();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(RAW_SVG_LOGO)));
      });

      doc.setFontSize(20);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(t('financialReport').toUpperCase(), 14, 38);
      
      let rangeText = t('allTime');
      if(pdfRange !== 'all') {
         const dict = { '7': t('last7days'), '15': t('last15days'), '30': t('last30days'), '90': t('last90days') };
         rangeText = dict[pdfRange] || '';
      }

      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text(`${t('period')}: ${rangeText}`, 14, 46);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`${profile.firstName} ${profile.lastName}`, 140, 38);
      if(profile.email) {
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(profile.email, 140, 43);
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 51, 196, 51);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(t('netBalance').toUpperCase(), 14, 61);
      doc.text(t('totalIncome').toUpperCase(), 80, 61);
      doc.text(t('totalExpenses').toUpperCase(), 140, 61);

      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105); 
      doc.text(formatCurrency(balTot), 14, 68);
      doc.text(formatCurrency(inTot), 80, 68);
      doc.text(formatCurrency(outTot), 140, 68);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 81,
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10, textColor: [71, 85, 105] }, 
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for(var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generado por Micapp - ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.height - 15);
        
        doc.setFont('helvetica', 'italic');
        doc.text("Reporte informativo basado en datos proporcionados por el usuario.", 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`Reporte_${profile.firstName}_${pdfRange}dias.pdf`);
      setActiveModal(null);
    } catch (error) {
      console.error("ERROR GENERANDO PDF:", error);
      showToast(t('errorPDF') || "Hubo un error al generar el PDF", 'error');
    }
  };

  /* ---------- PANTALLA DE CARGA INICIAL ---------- */
  if (isCheckingAuth || !exchangeRates || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center">
          <div className="loading-logo-container">
            <CustomLogo className="loading-logo-bg" />
            <div className="loading-logo-mask">
              <CustomLogo />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- VISTA ONBOARDING ---------- */
  if (!authUser || !profile.isConfigured) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="bg-mesh"></div>
        
        {/* Modal de Términos y Condiciones */}
        {activeModal === 'terms' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl relative text-left">
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition"><X size={20}/></button>
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <CustomLogo className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-slate-800">Términos y Condiciones de Uso</h2>
              </div>
              
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p className="font-semibold text-slate-400">Última actualización: 23 de Marzo de 2026</p>
                <p>Bienvenido a Micapp. Al utilizar esta aplicación, aceptas los siguientes términos:</p>
                
                <h3 className="font-bold text-slate-800 text-base mt-4">1. Uso de la aplicación</h3>
                <p>Micapp es una herramienta de gestión financiera personal. El usuario es responsable de ingresar información correcta y utilizar la aplicación de manera adecuada.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">2. Información del usuario</h3>
                <p>Los datos registrados dentro de la aplicación son proporcionados y gestionados por el propio usuario. Micapp no garantiza la exactitud de la información ingresada.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">3. Finalidad informativa</h3>
                <p>La información, reportes y análisis generados por la aplicación tienen fines únicamente informativos. Micapp no offers asesoramiento financiero, legal o contable.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">4. Responsabilidad</h3>
                <p>El uso de la aplicación es bajo responsabilidad del usuario. Micapp no se hace responsable por decisiones financieras tomadas con base en la información mostrada.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">5. Disponibilidad del servicio</h3>
                <p>Se intentará mantener la aplicación disponible en todo momento, pero no se garantiza funcionamiento ininterrumpido o libre de errores.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">6. Modificaciones</h3>
                <p>Estos términos pueden ser actualizados en cualquier momento. El uso continuo de la aplicación implica la aceptación de dichos cambios.</p>

                <h3 className="font-bold text-slate-800 text-base mt-4">7. Contacto</h3>
                <p>Para dudas o soporte, puedes contactar a: <span className="font-semibold text-blue-600">amurdigitalcontacto@gmail.com</span></p>
              </div>
              
              <button onClick={() => { setActiveModal(null); }} className="w-full mt-6 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition">Aceptar y Cerrar</button>
            </div>
          </div>
        )}

        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm animate-fade-in-up border-0 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center mx-auto mb-4">
                <CustomLogo className="w-24 h-24 drop-shadow-md" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{translations[currentLang].welcome}</h1>
              <p className="text-slate-500 mt-2 text-sm">{translations[currentLang].setupSubtitle}</p>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{translations[currentLang].language}</label>
                <select value={tempPreLoginLang} onChange={e => setTempPreLoginLang(e.target.value)} className="w-full mt-1.5 p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium transition-all">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{translations[currentLang].currency}</label>
                <select value={tempPreLoginCurr} onChange={e => setTempPreLoginCurr(e.target.value)} className="w-full mt-1.5 p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium transition-all">
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="BRL">Real Brasileño (BRL)</option>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={loginConGoogle}
              className="w-full py-4 font-bold rounded-xl shadow-sm flex items-center justify-center transition-all bg-white border border-slate-200 hover:border-blue-200 text-slate-700 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              <GoogleLogo />
              {translations[currentLang].startApp}
            </button>

            <p className="text-center text-[9px] font-medium text-slate-400 opacity-40 mt-3">
              Desarrollado por Amur digital
            </p>
            
            <p className="text-center text-xs text-slate-500 mt-5">
              Al ingresar a Micapp aceptas nuestros <button type="button" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="text-blue-600 font-bold hover:underline underline">términos y condiciones</button>
            </p>
          </GlassCard>
        </div>
      </>
    );
  }

  /* ---------- ARREGLO PARA TUTORIAL QUIRÚRGICO ---------- */
  const tutorialContent = [
    {
      title: "¡Bienvenido a Micapp!",
      text: "Registra tus ingresos y gastos fácilmente todos los días.",
      icon: <Wallet size={48} className="text-blue-500 mb-4" />
    },
    {
      title: "Tus Ahorros",
      text: "¡El Cochinito! Selecciona la categoría 'Ahorro' al registrar un gasto y ese dinero irá directo a tu meta visual.",
      icon: <PiggyBank size={48} className="text-pink-500 mb-4" />
    },
    {
      title: "Gráficos y Presupuestos",
      text: "Revisa tu distribución de gastos y establece límites mensuales por categoría desde el menú principal.",
      icon: <PieChartIcon size={48} className="text-emerald-500 mb-4" />
    },
    {
      title: "Reportes en PDF",
      text: "Descarga reportes de tus movimientos cuando lo necesites, ideales para tu control personal.",
      icon: <FileText size={48} className="text-purple-500 mb-4" />
    }
  ];

  /* ---------- VISTA PRINCIPAL APP ---------- */
  return (
    <div className={profile.theme === 'dark' ? 'dark-theme' : ''}>
      <style>{globalStyles}</style>
      <div className="bg-mesh"></div>

      {/* ---------------- MODAL TUTORIAL START ---------------- */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative text-center flex flex-col items-center transition-all duration-300 transform scale-100">
            {tutorialContent[tutorialStep].icon}
            <h2 className="text-2xl font-bold mb-3 text-slate-800">{tutorialContent[tutorialStep].title}</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {tutorialContent[tutorialStep].text}
            </p>

            <div className="flex gap-2 mb-8">
              {tutorialContent.map((_, idx) => (
                <span key={idx} className={`h-2.5 rounded-full transition-all duration-300 ${tutorialStep === idx ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-200'}`} />
              ))}
            </div>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowTutorial(false)} 
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Saltar
              </button>
              <button 
                onClick={() => {
                  if (tutorialStep < tutorialContent.length - 1) {
                    setTutorialStep(prev => prev + 1);
                  } else {
                    setShowTutorial(false);
                  }
                }} 
                className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
              >
                {tutorialStep < tutorialContent.length - 1 ? 'Siguiente' : 'Comenzar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TOASTS NOTIFICATIONS FLOTANTES ---------------- */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-toast border ${
          toast.type === 'info' ? 'bg-white border-slate-200 text-slate-700' : 
          toast.type === 'warning' ? 'bg-amber-100 border-amber-300 text-amber-800' :
          toast.type === 'error' ? 'bg-rose-500 border-rose-600 text-white' : 
          'bg-emerald-500 border-emerald-600 text-white'
        }`}>
          {toast.type === 'info' ? (
            <FileText size={20} className="shrink-0 text-blue-500" />
          ) : toast.type === 'warning' ? (
            <FileText size={20} className="shrink-0 text-amber-600" />
          ) : toast.type === 'error' ? (
            <AlertTriangle size={20} />
          ) : (
            <Check size={20} />
          )}
          {toast.msg}
        </div>
      )}

      {/* ---------------- MODALES ---------------- */}

      {/* MODAL ROMPER COCHINITO */}
      {activeModal === 'breakPiggy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <PiggyBank size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">{t('confirmBreakTitle')}</h2>
            <p className="text-slate-500 font-medium mb-4">{t('confirmBreakMsg')}</p>
            
            <form onSubmit={confirmBreakPiggy}>
              <div className="mb-6 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  {t('withdrawAmount')} (Máx: {formatCurrency(totalAhorrado)})
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  max={convertFromUSD(totalAhorrado).toFixed(2)}
                  value={breakAmount} 
                  onChange={(e) => setBreakAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold text-slate-800" 
                  required 
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => {setActiveModal(null); setBreakAmount('');}} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3.5 bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:bg-pink-700 transition">{t('breakPiggy')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR TRANSACCIÓN */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">{t('confirmDeleteTitle')}</h2>
            <p className="text-slate-500 font-medium mb-6">{t('confirmDeleteMsg')}</p>
            
            <div className="flex gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">{t('cancel')}</button>
              <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition">{t('confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'editProfile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{t('editProfile')}</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('firstName')}</label>
                  <input required value={tempProfile.firstName} onChange={e => setTempProfile({...tempProfile, firstName: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('lastName')}</label>
                  <input required value={tempProfile.lastName} onChange={e => setTempProfile({...tempProfile, lastName: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('email')} <span className="text-[10px] font-normal lowercase">{t('optional')}</span></label>
                <input type="email" value={tempProfile.email || ''} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('phone')} <span className="text-[10px] font-normal lowercase">{t('optional')}</span></label>
                <input type="tel" value={tempProfile.phone || ''} onChange={e => setTempProfile({...tempProfile, phone: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('currency')}</label>
                <select value={tempProfile.currency} onChange={e => setTempProfile({...tempProfile, currency: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition">{t('saveChanges')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PDF (FECHAS) */}
      {activeModal === 'downloadPDF' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{t('downloadPDFTitle')}</h2>
            
            <form onSubmit={generarPDF} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('timeRange')}</label>
                <select value={pdfRange} onChange={e => setPdfRange(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium">
                  <option value="7">{t('last7days')}</option>
                  <option value="15">{t('last15days')}</option>
                  <option value="30">{t('last30days')}</option>
                  <option value="90">{t('last90days')}</option>
                  <option value="all">{t('allTime')}</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition">{t('generatePDF')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTE ANUAL */}
      {activeModal === 'annualReport' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition"><X size={20}/></button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-1 text-slate-800">{t('annualSummaryTitle')}</h2>
            <p className="text-slate-500 font-medium mb-6">{t('year')} {anioActual}</p>
            
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-2xl flex justify-between items-center">
                <span className="font-semibold text-emerald-700 uppercase text-xs tracking-wider">{t('totalIncome')}</span>
                <span className="font-bold text-lg text-emerald-700">{formatCurrency(annualStats.ingresos)}</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl flex justify-between items-center">
                <span className="font-semibold text-rose-700 uppercase text-xs tracking-wider">{t('totalExpenses')}</span>
                <span className="font-bold text-lg text-rose-700">{formatCurrency(annualStats.egresos)}</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl flex justify-between items-center mt-2 border border-blue-100">
                <span className="font-bold text-blue-700 uppercase text-sm tracking-wider">{t('netBalance')}</span>
                <span className="font-extrabold text-xl text-blue-700">{formatCurrency(annualStats.balance)}</span>
              </div>
            </div>
            
            <button onClick={() => setActiveModal(null)} className="w-full mt-6 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition">{t('close')}</button>
          </div>
        </div>
      )}

      {/* MODAL DE PRESUPUESTOS POR CATEGORÍA */}
      {activeModal === 'budgets' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 transition"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <PiggyBank className="text-blue-600" size={28} /> {t('budgets')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CATEGORIAS_EGRESO.filter(c => c !== 'Ahorro').map(cat => {
                const spent = gastosPorCategoria.find(g => g.name === cat)?.value || 0;
                const limit = budgets[cat] ? parseFloat((convertFromUSD(budgets[cat])).toFixed(2)) : ''; 
                const percentage = limit > 0 ? (convertFromUSD(spent) / limit) * 100 : 0;
                
                let barColor = 'bg-blue-500';
                if (percentage > 100) barColor = 'bg-rose-500';
                else if (percentage > 80) barColor = 'bg-amber-500';
                else barColor = 'bg-emerald-500';

                return (
                  <div key={cat} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          {translateCategory(cat, currentLang)}
                        </span>
                        <input 
                          key={`${cat}-${currentCurrency}`}
                          type="number" 
                          step="0.01"
                          placeholder={t('noLimit')}
                          defaultValue={limit}
                          onBlur={(e) => handleBudgetChange(cat, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                          className="w-20 text-right p-1 text-sm bg-transparent border-b border-slate-300 outline-none focus:border-blue-500 font-semibold text-slate-700 placeholder-slate-400"
                        />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-1 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                        <span>{formatCurrency(spent)}</span>
                        <span>{limit > 0 ? `${percentage.toFixed(0)}%` : ''}</span>
                    </div>
                    {percentage > 100 && (
                        <p className="text-rose-500 text-xs mt-2 flex items-center gap-1 font-semibold animate-pulse"><AlertTriangle size={14}/> {t('budgetExceeded')}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 text-slate-800">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print relative z-30">
          <div>
            <div className="flex items-center gap-3">
              <CustomLogo className="w-8 h-8 drop-shadow-sm" />
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                {t('greeting')}, {profile.firstName}
              </h1>
              {/* MODIFICACIÓN QUIRÚRGICA: Botón del Ojito para ocultar/mostrar */}
              <button 
                onClick={() => setShowAmounts(!showAmounts)} 
                className="ml-2 p-2 rounded-full bg-white/50 border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors shadow-sm hover:shadow-md focus:outline-none"
                title={showAmounts ? "Ocultar saldos" : "Mostrar saldos"}
              >
                {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${comparisonStats.diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {comparisonStats.diff > 0 ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
              <span>
                {Math.abs(comparisonStats.diff).toFixed(1)}% {comparisonStats.diff > 0 ? t('spentMore') : t('spentLess')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              className="bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 font-semibold py-2 px-3 md:px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={mesActual} onChange={(e) => setMesActual(Number(e.target.value))}
            >
              {mesesTraduccion[currentLang].map((mes, idx) => (
                <option key={idx} value={idx}>{mes}</option>
              ))}
            </select>
            <select 
              className="bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 font-semibold py-2 px-3 md:px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={anioActual} onChange={(e) => setAnioActual(Number(e.target.value))}
            >
              {Array.from({ length: 6 }, (_, i) => 2025 + i).map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
            
            {/* Menú Hamburguesa */}
            <div className="relative ml-2">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`p-2.5 rounded-xl border transition-all ${isMenuOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden py-2 animate-fade-in-up">
                    
                    {/* IDIOMA */}
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">{t('language')}</span>
                      <select 
                        className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
                        value={profile.language} 
                        onChange={(e) => { setProfile({...profile, language: e.target.value}); }}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>

                    {/* MODO OSCURO */}
                    <div className="px-4 py-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">{t('theme')}</span>
                      <select 
                        className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
                        value={profile.theme || 'light'} 
                        onChange={(e) => { setProfile({...profile, theme: e.target.value}); }}
                      >
                        <option value="light">{t('lightMode')}</option>
                        <option value="dark">{t('darkMode')}</option>
                      </select>
                    </div>

                    <button onClick={() => openMenuModal('budgets')} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition">
                      <PiggyBank size={18} className="opacity-70" /> {t('budgets')}
                    </button>

                    <button onClick={() => openMenuModal('annualReport')} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition">
                      <FileText size={18} className="opacity-70" /> {t('annualReport')}
                    </button>
                    
                    <button onClick={() => openMenuModal('downloadPDF')} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition">
                      <Download size={18} className="opacity-70" /> {t('downloadTransactions')}
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button onClick={() => openMenuModal('editProfile')} className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition">
                      <UserCog size={18} className="opacity-70" /> {t('editProfile')}
                    </button>

                    {authUser && (
                      <button onClick={cerrarSesion} className="w-full text-left px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition">
                        <LogOut size={18} className="opacity-70" /> {t('logout')}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 no-print">
          <GlassCard className="relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('balance')}</p>
                {/* MODIFICACIÓN QUIRÚRGICA: Ocultar si Ojito está presionado */}
                <h2 className={`text-2xl md:text-3xl font-bold mt-1 ${balanceHistorico >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                  {renderAmount(balanceHistorico)}
                </h2>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                <Wallet size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('income')}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">
                  {renderAmount(stats.ingresos)}
                </h2>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('expenses')}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-rose-600 mt-1">
                  {renderAmount(stats.egresos)}
                </h2>
              </div>
              <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                <TrendingDown size={24} />
              </div>
            </div>
          </GlassCard>

          {/* TARJETA META DE AHORRO CON CAMBIOS */}
          <GlassCard>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('savingsGoal')}</p>
              </div>
              <div className="flex gap-2">
                {/* BOTÓN ROMPER COCHINITO */}
                {totalAhorrado > 0 && (
                  <button 
                    onClick={() => openMenuModal('breakPiggy')} 
                    title={t('breakPiggy')} 
                    className="p-2 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 hover:scale-105 transition-all shadow-sm"
                  >
                    <PiggyBank size={18} />
                  </button>
                )}
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                  <Target size={18} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 h-8 mt-1">
              {isEditingMeta ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number" value={tempMeta} onChange={(e) => setTempMeta(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveMeta()}
                    className="w-full bg-white/70 border border-purple-200 rounded-md px-2 py-1 text-lg font-bold text-slate-800 outline-none focus:border-purple-500" autoFocus
                  />
                  <button onClick={handleSaveMeta} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 p-1 rounded-md transition-colors"><Check size={20} /></button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800">{renderAmount(metaAhorro)}</h2>
                  <button onClick={iniciarEdicionMeta} className="text-slate-400 hover:text-purple-600 hover:bg-purple-100 p-1.5 rounded-md transition-colors">
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>

            {totalAhorrado > 0 && (
              <p className="text-sm font-bold text-blue-600 mt-1 animate-fade-in-up">
                {t('savedSoFar')}: {renderAmount(totalAhorrado)}
              </p>
            )}
            
            <div className="w-full bg-slate-200/50 rounded-full h-2.5 mt-3 overflow-hidden relative">
              <div className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${progresoAhorro >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`} style={{ width: `${Math.min(progresoAhorro, 100)}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs font-semibold text-slate-500">{t('progress')} {progresoAhorro.toFixed(1)}%</p>
            </div>

            {/* MENSAJE MOTIVACIONAL CUANDO SE LLEGA A LA META */}
            {progresoAhorro >= 100 && totalAhorrado > 0 && (
              <p className="text-sm font-bold text-emerald-600 mt-2 text-center animate-pulse bg-emerald-50 py-1 rounded-md">
                {t('goalReached')}
              </p>
            )}
          </GlassCard>
        </div>

        {/* CONSEJOS DE INVERSIÓN */}
        <div className={`transition-all duration-500 overflow-hidden no-print ${stats.innecesarios > 0 ? 'opacity-100 max-h-[500px]' : 'opacity-80 max-h-[200px]'}`}>
          <GlassCard className="border-l-4 border-l-amber-500 bg-gradient-to-r from-white/60 to-amber-50/40">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
                <Lightbulb size={24} className={stats.innecesarios > 0 ? "animate-pulse" : ""} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  {t('investmentTip')}
                  {stats.innecesarios > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full">
                      {t('unnecessaryExpenses')}: {renderAmount(stats.innecesarios)}
                    </span>
                  )}
                </h3>
                <p className="text-slate-600 mt-2 font-medium leading-relaxed whitespace-pre-line">
                  {obtenerSugerenciaInversion(stats.innecesarios)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          
          {/* FORMULARIO */}
          <GlassCard className="lg:col-span-1">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  {editingTransactionId ? <Pencil size={16} /> : '+'}
                </span>
                {editingTransactionId ? t('editRecord') : t('newRecord')}
              </h2>
              {editingTransactionId && (
                <button onClick={cancelarEdicion} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  {t('cancel')}
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-200/50 rounded-xl">
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer font-semibold transition-all ${formData.type === 'egreso' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input type="radio" name="type" value="egreso" checked={formData.type === 'egreso'} onChange={handleInputChange} className="hidden" />
                  {t('expenseType')}
                </label>
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer font-semibold transition-all ${formData.type === 'ingreso' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input type="radio" name="type" value="ingreso" checked={formData.type === 'ingreso'} onChange={handleInputChange} className="hidden" />
                  {t('incomeType')}
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('concept')}</label>
                <input name="concept" value={formData.concept} onChange={handleInputChange} placeholder={t('conceptPlaceholder')} className="w-full mt-1 p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('amount')}</label>
                  <input type="number" name="amount" step="0.01" min="0" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className="w-full mt-1 p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('date')}</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full mt-1 p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('category')}</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full mt-1 p-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  {(formData.type === 'egreso' ? CATEGORIAS_EGRESO : CATEGORIAS_INGRESO).map(c => (
                    <option key={c} value={c}>{translateCategory(c, currentLang)}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                {editingTransactionId ? t('updateBtn') : t('saveBtn')}
              </button>
            </form>
          </GlassCard>

          {/* GRÁFICO */}
          <GlassCard className="lg:col-span-2 flex flex-col">
            <h2 className="text-xl font-bold mb-2">{t('distribution')}</h2>
            {gastosPorCategoria.length > 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={gastosPorCategoria} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} stroke="none">
                      {gastosPorCategoria.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => renderAmount(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                <PieChartIcon size={64} className="mb-4 opacity-50" />
                <p className="font-medium">{t('noExpenses')}</p>
              </div>
            )}
            
            {gastosPorCategoria.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {gastosPorCategoria.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    {translateCategory(cat.name, currentLang)} ({(cat.value / stats.egresos * 100).toFixed(0)}%)
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* LISTA RESPONSIVA DE MOVIMIENTOS (NUEVO DISEÑO MEJORADO) */}
        <GlassCard className="overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4">{t('transactions')}</h2>
          
          <div className="space-y-3 mt-2">
            {currentMonthTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-medium">
                {t('noTransactions')}
              </div>
            ) : (
              [...currentMonthTransactions].sort((a,b) => new Date(b.date) - new Date(a.date)).map(tr => {
                const bgClass = tr.category === 'Ahorro' 
                  ? 'bg-amber-50 border-amber-100' 
                  : tr.type === 'ingreso' 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-rose-50 border-rose-100';

                return (
                  <div key={tr.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bgClass} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold text-[14px]">
                          {tr.concept}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 font-semibold text-[12px]">
                            {tr.date.split('-').reverse().join('/')} {tr.createdAt && `• ${tr.createdAt}`}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md" style={{ color: COLORES_CATEGORIAS[tr.category] || '#94a3b8', backgroundColor: `${COLORES_CATEGORIAS[tr.category] || '#94a3b8'}20` }}>
                            {translateCategory(tr.category, currentLang)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <span className={`font-extrabold ${tr.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tr.type === 'ingreso' ? '+' : '-'}{renderAmount(tr.amount)}
                      </span>
                      <div className="flex items-center gap-1 no-print">
                        <button onClick={() => iniciarEdicionTransaccion(tr)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setTransactionToDelete(tr.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}