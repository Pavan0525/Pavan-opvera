import { supabase } from './supabaseClient'

/**
 * Create audit log entry
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity (user, mentor, company)
 * @param {string} entityId - ID of the entity
 * @param {Object} details - Additional details
 * @param {string} userId - User who performed the action
 */
export async function createAuditLog(action, entityType, entityId, details = {}, userId = null) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        user_id: userId,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Audit log creation failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Audit log error:', error)
    throw error
  }
}

/**
 * Get audit logs for admin review
 * @param {string} entityType - Type of entity to filter by
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} - Audit logs
 */
export async function getAuditLogs(entityType = null, status = null) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Get audit logs error:', error)
    throw error
  }
}

/**
 * Update audit log status
 * @param {string} logId - Audit log ID
 * @param {string} status - New status (pending, approved, rejected)
 * @param {string} adminId - Admin user ID
 * @param {string} notes - Admin notes
 */
export async function updateAuditLogStatus(logId, status, adminId, notes = '') {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .update({
        status,
        admin_id: adminId,
        admin_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single()

    if (error) {
      throw new Error(`Audit log update failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Update audit log error:', error)
    throw error
  }
}
