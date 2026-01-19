import { query } from "@/app/database/postgre";

interface Item {
    affilate: string,
    quantity: number,
    product_id: string
}

async function getPrice(product_id: string) {
    const price = await fetch('https://store.payproglobal.com/api/Products/GetProductPricing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            products: [{ productId: product_id }],
            vendorAccountId: process.env.PAYPRO_VENDOR_ACCOUNT_ID,
            apiSecretKey: process.env.PAYPRO_API_SECRET_KEY
        })
    }).then(res => res.json()).then(data => data.response.productPricings[0].billingUnitPrice);

    return price;
}

export async function GET() {
    const affilates: Item[] = await query('SELECT affilate, quantity, product_id FROM subscriptions');
    const productPrice: Record<string, number> = {};
    const stats = {
        cinecom: {
            count: 0,
            networth: 0
        },
        premierebasics: {
            count: 0,
            networth: 0
        },
        aftereffectsbasics: {
            count: 0,
            networth: 0
        }
    };

    for (const item of affilates) {
        if (!item.affilate) continue
        const price = productPrice[item.product_id] || await getPrice(item.product_id);
        productPrice[item.product_id] = price;
        stats[item.affilate as keyof typeof stats].count += item.quantity;
        stats[item.affilate as keyof typeof stats].networth += item.quantity * price;
    }

    return Response.json(stats)
}