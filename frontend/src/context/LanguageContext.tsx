import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'zh' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
}

const translations = {
  en: {
    welcome: 'Home',
    meetings: 'Meeting',
    emails: 'Email',
    tasks: 'Task',
    reports: 'Reports',
    quickActions: 'Quick Actions',
    scheduleMeeting: 'Schedule Meeting',
    composeEmail: 'Compose Email',
    createTask: 'Create Task',
    generateReport: 'Generate Report',
    upgrade: 'Upgrade',
    notifications: 'Notifications',
    settings: 'Settings',
    language: 'Language',
  },
  zh: {
    welcome: '欢迎回来',
    meetings: '今日会议',
    emails: '未读邮件',
    tasks: '待办任务',
    reports: '报告',
    quickActions: '快捷操作',
    scheduleMeeting: '安排会议',
    composeEmail: '写邮件',
    createTask: '创建任务',
    generateReport: '生成报告',
    upgrade: '升级',
    notifications: '通知',
    settings: '设置',
    language: '语言',
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    meetings: 'Reuniones de hoy',
    emails: 'Correos sin leer',
    tasks: 'Tareas pendientes',
    reports: 'Informes',
    quickActions: 'Acciones rápidas',
    scheduleMeeting: 'Programar reunión',
    composeEmail: 'Redactar correo',
    createTask: 'Crear tarea',
    generateReport: 'Generar informe',
    upgrade: 'Mejorar',
    notifications: 'Notificaciones',
    settings: 'Ajustes',
    language: 'Idioma',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage,
        translations: translations[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
