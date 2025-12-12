import { shouldShowField, fieldVisibilityRules } from '../utils/fieldDependencies';
import type { FieldValue } from '../types/form';

/**
 * ConditionalFieldManager - Utility component for managing field visibility
 * 
 * This component provides utilities to check if fields should be visible
 * based on form data and defined rules.
 */
export class ConditionalFieldManager {
  /**
   * Check if a field should be visible
   */
  static shouldShow(fieldId: string, formData: Record<string, FieldValue>): boolean {
    return shouldShowField(fieldId, formData, fieldVisibilityRules);
  }
  
  /**
   * Check if multiple fields should be visible
   */
  static shouldShowMultiple(
    fieldIds: string[],
    formData: Record<string, FieldValue>
  ): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    fieldIds.forEach(fieldId => {
      result[fieldId] = this.shouldShow(fieldId, formData);
    });
    return result;
  }
  
  /**
   * Check if a step should be shown
   * Step 4 should only show if Joint Account or Trust is selected
   */
  static shouldShowStep(stepNumber: number, formData: Record<string, FieldValue>): boolean {
    if (stepNumber === 4) {
      // Step 4 (Secondary Account Holder) should only show for Joint or Trust accounts
      const typeOfAccount = (formData['type_of_account'] as string[]) || [];
      const typeOfAccountRight = (formData['type_of_account_right'] as string[]) || [];
      
      const hasJoint = typeOfAccount.includes('joint_tenant');
      const hasTrust = typeOfAccountRight.includes('trust');
      
      return hasJoint || hasTrust;
    }
    
    // All other steps are always visible
    return true;
  }
  
  /**
   * Check if Step 1 should be skipped (Retirement checkbox)
   */
  static shouldSkipStep1(formData: Record<string, FieldValue>): boolean {
    return (formData['retirement_checkbox'] as boolean) === true;
  }
}

