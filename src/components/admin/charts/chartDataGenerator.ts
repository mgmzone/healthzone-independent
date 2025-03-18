
// This file re-exports all the functions and types from the refactored files
// to maintain backward compatibility

export * from './types';
export * from './summaryData';
export * from './dateUtils';
export * from './emptyDataGenerator';
export * from './activityProcessor';

// Re-export ActivityLogItem type from our admin service for backward compatibility
export { ActivityLogItem } from '@/lib/services/admin';
