// GET - لیست شاپ‌ها
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    try {
        let shops = await db.shops.findMany({
            where: type ? { type } : {},
            orderBy: { createdAt: 'desc' }
        })

        return Response.json(shops)
    } catch (error) {
        return Response.json({ error: 'Failed to fetch shops' }, { status: 500 })
    }
}

// POST - ایجاد شاپ جدید
export async function POST(request) {
    const body = await request.json()

    try {
        const shop = await db.shops.create({
            data: {
                name: body.name,
                code: body.code,
                type: body.type,
                fee: body.fee,
                status: true
            }
        })

        return Response.json(shop)
    } catch (error) {
        return Response.json({ error: 'Failed to create shop' }, { status: 500 })
    }
}