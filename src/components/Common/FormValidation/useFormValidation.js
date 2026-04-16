import { useCallback, useState } from "react";

/**
 * useFormValidation - frontend hook
 *
 * Usage:
 *   const { errors, warnings, showPanel, showSuccess, validate, clearErrors, errorCount, hasErrors } = useFormValidation();
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     const ok = validate([
 *       requiredString(name, "Name", "Basic Info", "field-name"),
 *       requiredFile(file, "Receipt", "Payment", "field-receipt"),
 *     ]);
 *     if (!ok) return;
 *     // proceed...
 *   };
 */
export function useFormValidation() {
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    /**
     * Run validation rules.
     * @param {Array} rules - array of { field, message, section, scrollToId, type, condition } objects
     * @returns {boolean} true if valid, false if there are errors
     */
    const validate = useCallback((rules = []) => {
        const newErrors = [];
        const newWarnings = [];

        rules.forEach((rule) => {
            if (!rule) return;
            // If condition is provided, evaluate it
            const fails =
                rule.condition !== undefined
                    ? rule.condition
                    : rule.value === undefined
                      ? false
                      : !rule.value;
            if (fails) {
                const item = {
                    field: rule.field,
                    message: rule.message,
                    section: rule.section || "General",
                    scrollToId: rule.scrollToId,
                };
                if (rule.type === "warning") {
                    newWarnings.push(item);
                } else {
                    newErrors.push(item);
                }
            }
        });

        setErrors(newErrors);
        setWarnings(newWarnings);

        if (newErrors.length > 0) {
            setShowPanel(true);
            setShowSuccess(false);
            return false;
        }

        if (newWarnings.length > 0) {
            setShowPanel(true);
        }

        return true;
    }, []);

    const clearErrors = useCallback(() => {
        setErrors([]);
        setWarnings([]);
        setShowPanel(false);
        setShowSuccess(false);
    }, []);

    const hidePanel = useCallback(() => setShowPanel(false), []);
    const openPanel = useCallback(() => setShowPanel(true), []);

    const flashSuccess = useCallback(() => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    }, []);

    return {
        errors,
        warnings,
        showPanel,
        showSuccess,
        validate,
        clearErrors,
        hidePanel,
        openPanel,
        flashSuccess,
        errorCount: errors.length + warnings.length,
        hasErrors: errors.length > 0,
    };
}

// ============================================================
// Rule factory helpers
// ============================================================

export const requiredString = (value, fieldLabel, section, scrollToId) => ({
    field: fieldLabel,
    message: `${fieldLabel} is required`,
    section,
    scrollToId,
    condition: !value || !String(value).trim(),
});

export const minLength = (value, min, fieldLabel, section, scrollToId) => ({
    field: fieldLabel,
    message: `${fieldLabel} must be at least ${min} characters`,
    section,
    scrollToId,
    condition: !value || String(value).trim().length < min,
});

export const requiredFile = (file, fieldLabel, section, scrollToId) => ({
    field: fieldLabel,
    message: `Please upload a ${fieldLabel.toLowerCase()}`,
    section,
    scrollToId,
    condition: !file,
});

export const requiredArray = (arr, fieldLabel, section, scrollToId) => ({
    field: fieldLabel,
    message: `At least one ${fieldLabel.toLowerCase()} is required`,
    section,
    scrollToId,
    condition: !arr || arr.length === 0,
});

export const positiveNumber = (value, fieldLabel, section, scrollToId) => ({
    field: fieldLabel,
    message: `${fieldLabel} must be a positive number`,
    section,
    scrollToId,
    condition: isNaN(Number(value)) || Number(value) < 0,
});

export const validEmail = (
    value,
    fieldLabel = "Email",
    section,
    scrollToId,
) => ({
    field: fieldLabel,
    message: `Please enter a valid email address`,
    section,
    scrollToId,
    condition:
        !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()),
});

export const validPhone = (
    value,
    fieldLabel = "Phone",
    section,
    scrollToId,
) => ({
    field: fieldLabel,
    message: `Please enter a valid phone number`,
    section,
    scrollToId,
    condition: !value || !/^[\d\s\+\-\(\)]{6,20}$/.test(String(value).trim()),
});

export const fileSizeLimit = (
    file,
    maxMB,
    fieldLabel,
    section,
    scrollToId,
) => ({
    field: fieldLabel,
    message: `${fieldLabel} must be under ${maxMB}MB`,
    section,
    scrollToId,
    condition: file && file.size > maxMB * 1024 * 1024,
});

export const fileTypeAllowed = (
    file,
    allowedTypes,
    fieldLabel,
    section,
    scrollToId,
) => ({
    field: fieldLabel,
    message: `${fieldLabel} must be one of: ${allowedTypes.join(", ")}`,
    section,
    scrollToId,
    condition:
        file &&
        !allowedTypes.some(
            (t) =>
                file.type.includes(t) ||
                file.name.toLowerCase().endsWith(t.replace(".", "")),
        ),
});

export const customRule = (
    condition,
    fieldLabel,
    message,
    section,
    scrollToId,
) => ({
    field: fieldLabel,
    message,
    section,
    scrollToId,
    condition: Boolean(condition),
});
