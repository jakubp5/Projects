/**
 * Formats a given date string into `DD.MM.YYYY` format.
 *
 * @param {string} date - The date string to be formatted, in `YYYY-MM-DD` format.
 * @returns {string} - The formatted date string as `DD.MM.YYYY`.
 */
export function formatDate(date: string): string {
    const dateObj = new Date(date)
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()

    return `${dd}. ${mm} .${yyyy}`
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString) // Parse the ISO string into a Date object

    // Ensure the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string')
    }

    // Extract components
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
}
