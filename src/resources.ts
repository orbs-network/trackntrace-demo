export function gatewayImage(brand: string): string {
    return process.env.REACT_APP_BASE_URL + {
        'amazon': '/amazon.png',
        'p&g': '/png.png',
        'fedex': '/fedex.png',
        'dhl': '/dhl.png'
    }[brand.toLowerCase()] || '/unknown_brand.png';
}

export function partnerBrandImage(brand: string): string {
    return process.env.REACT_APP_BASE_URL + {
        'amazon': '/amazon.png',
        'p&g': '/png.png',
        'fedex': '/fedex.png',
        'dhl': '/dhl.png'
    }[brand.toLowerCase()] || '/unknown_brand.png';
}

export function stageImage(stage: string): string {
    return process.env.REACT_APP_BASE_URL + {
        'factory': '/factory.svg',
        'mixing': '/mixingcenter.svg',
        'distribution': '/distributioncenter.svg',
        'retail': '/retailstorage.svg'
    }[stage.toLowerCase().replace(/\s/g, "")] || '/unknown_stage.svg';
}

