
// This file re-exports all the functions and types from the refactored files
// to maintain backward compatibility

// Re-export functions
export * from './summaryData';
export * from './dateUtils';
export * from './emptyDataGenerator';
export * from './activityProcessor';

// Re-export types with proper 'export type' syntax
export type { TimeFilter, TimeFilteredData } from './types';

// Re-export values
export { chartConfig } from './types';

// Re-export ActivityLogItem type from our admin service for backward compatibility
export type { ActivityLogItem } from '@/lib/services/admin';
