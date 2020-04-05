import csv

w = csv.writer(open('./public/gw-conf.csv','w'))

# rows = [
#         ["id", "alias", "locationCategory", "siteCategory", "backgroomGatewayId"],
#         ["gwid1", "gwid1-alias", "gwid1-loccat", "gwid1-sitecat", "gwid2"],
#         ["gwid2", "gwid2-alias", "gwid2-loccat", "gwid2-sitecat", ""],
# ]

rows = [
    ["id", "alias", "locationCategory", "siteCategory", "backgroomGatewayId"],
    ["3c71bf63e190", "Original"],
    ["GW98f4ab141D14", "P&G Manufacturing"],
    ["GW98f4ab141D70", "P&G Truck"],
    ["GW984fab141D70", "P&G Truck"],
    ["GW98f4ab141D38", "Customer DC or P&G DC"],
    ["GW98f4ab141DF4", "Customer DC or P&G DC Shelf"],
    ["GW98f4ab141D0C", "P&G Customer Store"],
]


for row in rows:
    w.writerow(row)
