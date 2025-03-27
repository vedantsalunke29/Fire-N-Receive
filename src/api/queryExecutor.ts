/* eslint-disable @typescript-eslint/no-explicit-any */
import { employeesData, salesData, productsData, customersData } from "../data/mock-data"

type QueryResult = {
    data: any[]
    columns: string[]
}
  
export const queryExecutor: (query: string) => Promise<QueryResult> = async (query: string): Promise<QueryResult> => {
  
    const queryLower = query.toLowerCase()
  
    if (queryLower.includes("employee") || queryLower.includes("staff")) {
      return Promise.resolve({
        data: employeesData,
        columns: Object.keys(employeesData[0]),
      })
    } else if (queryLower.includes("sale") || queryLower.includes("revenue")) {
      return Promise.resolve({
        data: salesData,
        columns: Object.keys(salesData[0]),
      })
    } else if (queryLower.includes("product") || queryLower.includes("item")) {
      return Promise.resolve({
        data: productsData,
        columns: Object.keys(productsData[0]),
      })
    } else if (queryLower.includes("customer") || queryLower.includes("client")) {
      return Promise.resolve({
        data: customersData,
        columns: Object.keys(customersData[0]),
      })
    }
  
    return Promise.resolve({
      data: employeesData,
      columns: Object.keys(employeesData[0]),
    })
  }
