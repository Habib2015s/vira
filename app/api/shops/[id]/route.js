// GET - نمایش یک شاپ
export async function GET(request, { params }) {
    const { id } = params

    try {
        const shop = await db.shops.findUnique({
            where: { id }
        })

        if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 })
        }

        return Response.json(shop)
    } catch (error) {
        return Response.json({ error: 'Failed to fetch shop' }, { status: 500 })
    }
}

// PUT - ویرایش شاپ
export async function PUT(request, { params }) {
    const { id } = params
    const body = await request.json()

    try {
        const shop = await db.shops.update({
            where: { id },
            data: {
                name: body.name,
                code: body.code,
                type: body.type,
                fee: body.fee
            }
        })

        return Response.json(shop)
    } catch (error) {
        return Response.json({ error: 'Failed to update shop' }, { status: 500 })
    }
}

// PATCH - تغییر وضعیت
export async function PATCH(request, { params }) {
    const { id } = params
    const body = await request.json()

    try {
        const shop = await db.shops.update({
            where: { id },
            data: {
                status: body.status
            }
        })

        return Response.json(shop)
    } catch (error) {
        return Response.json({ error: 'Failed to toggle status' }, { status: 500 })
    }
}

// DELETE - حذف شاپ
export async function DELETE(request, { params }) {
    const { id } = params

    try {
        await db.shops.delete({
            where: { id }
        })

        return Response.json({ success: true })
    } catch (error) {
        return Response.json({ error: 'Failed to delete shop' }, { status: 500 })
    }
}