# Serialize/Deserialize Item Preview Data  

## Overview  
This utility script converts or decodes a `CEconItemPreviewDataBlock` protobuf from CS:GO or CS2 into a serialized string. The resulting string can then be used in:  

- **Console commands**:  
`csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`

- **Steam links**:  
`steam://rungame/730/76561202255233023/+csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`

## Installation  

`npm install cs-inspect-serializer`

## Example use  
```
  import { serialize, deserialize } from "cs-inspect-serializer"

  const serialized = serialize({
    rarity:5,
    defindex:60,
    paintindex:440,
    paintseed:353,
    paintwear:0.005411375779658556,
  });

  const deserialized = deserialize("00183C20B803280538E9A3C5DD0340E102C246A0D1");
```

## Notes

- The quality field controls whether StatTrak appears in the item name. Ensure you set quality to 9 (Strange) to see the StatTrak name in addition to the counter.

## Credits

- CashTrader-Pro / Monkeybizzcs also had the protobuff js file.  
They also have a similar module for C# [here](https://github.com/CashTrader-Pro/cs2-gen)

1.0.6 , Generated and updated the protobuf file from mckays node-globaloffensive.  
https://github.com/DoctorMcKay/node-globaloffensive/tree/master 

[Twitter](https://x.com/MonkeyBizzCS)  
[Github](https://github.com/CashTrader-Pro/cs2-gen/tree/main)