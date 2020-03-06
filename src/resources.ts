export function partnerBrandImage(brand: string): string {
    return {
        'amazon': '/amazon.png',
        'p&g': '/png.png',
        'fedex': '/fedex.png',
        'dhl': '/dhl.png'
    }[brand.toLowerCase()] || '/unknown_brand.png';
}

export function stageImage(stage: string): string {
    return {
        'factory': '/factory.svg',
        'mixingcenter': '/mixingcenter.svg',
        'distributioncenter': '/distributioncenter.svg',
        'retailstorage': '/retailstorage.svg'
    }[stage.toLowerCase().replace(/\s/g, "")] || '/unknown_stage.svg';
}

