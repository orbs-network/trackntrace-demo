export function gatewayImage(gatewayId: string): string {
    return process.env.REACT_APP_BASE_URL + ({
        ["3c71bf63e190".toLowerCase()]: '/mixingcenter.svg',
        ["GW98f4ab141D14".toLowerCase()]: '/factory.svg',
        ["GW984fab141D70".toLowerCase()]: '/truck.svg', //"P&G Truck",
        ["GW98f4ab141D70".toLowerCase()]: '/truck.svg', //"P&G Truck",
        ["GW98f4ab141D38".toLowerCase()]: '/distributioncenter.svg',
        ["GW98f4ab141DF4".toLowerCase()]: '/inventory.svg', //"Customer DC or P&G DC Shelf",
        ["GW98f4ab141D0C".toLowerCase()]: '/retailstorage.svg',
        // ["Original".toLowerCase()]:  '/mixingcenter.svg',
        // ["P&G Manufacturing".toLowerCase()]:  '/factory.svg',
        // ["P&G Truck".toLowerCase()]:  '/truck.svg', //"P&G Truck",
        // ["Customer DC or P&G DC".toLowerCase()]:  '/distributioncenter.svg',
        // ["Customer DC or P&G DC Shelf".toLowerCase()]:  '/inventory.svg', //"Customer DC or P&G DC Shelf",
        // ["P&G Customer Store".toLowerCase()]:  '/retailstorage.svg',
    }[gatewayId.toLowerCase()] || '/mixingcenter.svg');
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

