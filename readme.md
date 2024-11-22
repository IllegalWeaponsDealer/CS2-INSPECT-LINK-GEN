# Serialize Item Preview Data  

## Overview  
This utility script converts a `CEconItemPreviewDataBlock` protobuf from CS:GO or CS2 into a serialized string. The resulting string can then be used in:  

- **Console commands**:  
`csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`

- **Steam links**:  
`steam://rungame/730/76561202255233023/+csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`

## Installation  

Install the required dependencies:  
`npm install`   
`crc protobufjs`

## Example use  
```
import serializeItemPreviewData from "./serializeItemPreviewData.ts"; // Or your own path

const encodedProto = serializeItemPreviewData({
    rarity: -10,
    defindex: 7,
    paintindex: 44,
    quality: 9, // Ensure this is 9 (Strange) for StatTrak naming
    paintwear: 0.00696969696969,
    paintseed: 661,
    killeaterscoretype: 0,
    killeatervalue: 420,
    origin: 8
});

// Generates a Stattrak ak-47 case hardened 661

console.log("csgo_econ_action_preview", encodedProto);
```

## Notes

- The serialization works as expected, there may be room for optimization in how wiretypes are handled. However im not great with protobufs. For now, the implementation is stable and unlikely to change.

- The quality field controls whether StatTrak appears in the item name. Ensure you set quality to 9 (Strange) to see the StatTrak name in addition to the counter.

## Credits

- DoctorMcKays general structure of the protobuf in their node-globaloffensive/cstrike15_gcmessages.js.

[Github](https://github.com/DoctorMcKay/)  
[Website](https://dev.doctormckay.com/)

- CashTrader-Pro and Monkeybizzcs also had alot of code around how this subject

[Twitter](https://x.com/MonkeyBizzCS)  
[Github](https://github.com/CashTrader-Pro/cs2-gen/tree/main)