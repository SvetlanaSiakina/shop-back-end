export interface Product {
    id?: string,
    description: string,
    price: number,
    title: string
}

export interface ProductStock {
    product_id: string,
    count: number
}

