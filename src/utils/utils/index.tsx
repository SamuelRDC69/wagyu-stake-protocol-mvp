export * from './formatters'
export * from './calculations'
export * from './animations'

export const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms))

export const truncateAddress = (address: string, chars = 4): string => {
    if (!address) return ''
    const start = address.slice(0, chars)
    const end = address.slice(-chars)
    return `${start}...${end}`
}

export const debounce = <F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
) => {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
        if (timeout) {
            clearTimeout(timeout)
        }

        return new Promise(resolve => {
            timeout = setTimeout(() => resolve(func(...args)), waitFor)
        })
    }
}