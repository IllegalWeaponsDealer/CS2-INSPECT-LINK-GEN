/* INFORMATION AND RESOURCES
    proto structure (tnx drmkay): https://raw.githubusercontent.com/DoctorMcKay/node-globaloffensive/refs/heads/master/protobufs/generated/cstrike15_gcmessages.js
    github:cashtrader-pro and monkeybizzcs (twitter) also had alot of data around how this is done. 
*/

import { crc32 } from "crc"; // npm i crc
import { Writer } from "protobufjs/minimal"; // npm i protobufjs

interface Sticker {
    slot?:number | null
    sticker_id?:number | null
    wear?:number | null
    scale?:number | null
    rotation?:number | null
    tint_id?:number | null
    offset_x?:number | null
    offset_y?:number | null
    offset_z?:number | null 
    pattern?:number | null
}

interface CEconItemPreviewData { // Keys with optional chaining and | null for different type of structures
    accountid?: number | null
    itemid?: number | Long | null
    defindex?: number | null
    paintindex?: number | null
    rarity: number | null // If this is set to a negative value (e.g., -10), CS2 appears to automatically determine the rarity.
    quality?: number | null // If you don't set this and wonder why StatTrak skins show the counter but not "StatTrak" in the name, this is why. (StatTrak is 9)
    paintwear?: number | null
    paintseed?: number | null
    killeaterscoretype?: number | null
    killeatervalue?: number | null
    customname?: string | null 
    inventory?: number | null
    origin?: number | null 
    questid?: number | null 
    dropreason?: number | null
    musicindex?: number | null 
    entindex?: number | null
    petindex?: number | null
    stickers?: Sticker[] | null
    keychains?: Sticker[] | null; // keychains are just a repeat of sticker
}

/**
 * Serializes item preview data for CS2 and CSGO inspect commands.
 * 
 * Example output:
 * ```
 * 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456
 * ```
 * 
 * This serialized string can be used for:
 * - CS2 and CSGO console commands
 *   `csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`  
 * - Inspect links
 *   `steam://rungame/730/76561202255233023/+csgo_econ_action_preview 001807202C28F6FFFFFF0F3009388EC491DF03409505480050A4037008420FC456`
 *
 * @param data - The preview data of type `CEconItemPreviewData` used to generate the serialized data.
 * @returns A serialized string that represents the inspect command data.
*/
export default function serializeItemPreviewData(data:CEconItemPreviewData):string {
    try {
        const itemFields: { key: keyof CEconItemPreviewData, type:string, wireType:number}[] = [
            { key: "accountid", type: "uint32", wireType: 8 },
            { key: "itemid", type: "uint64", wireType: 16 },
            { key: "defindex", type: "uint32", wireType: 24 },
            { key: "paintindex", type: "uint32", wireType: 32 },
            { key: "rarity", type: "uint32", wireType: 40 },
            { key: "quality", type: "uint32", wireType: 48 },
            { key: "paintwear", type: "uint32", wireType: 56 },
            { key: "paintseed", type: "uint32", wireType: 64 },
            { key: "killeaterscoretype", type: "uint32", wireType: 72 },
            { key: "killeatervalue", type: "uint32", wireType: 80 },
            { key: "customname", type: "string", wireType: 90 },
            { key: "inventory", type: "uint32", wireType: 104 },
            { key: "origin", type: "uint32", wireType: 112 },
            { key: "questid", type: "uint32", wireType: 120 },
            { key: "dropreason", type: "uint32", wireType: 128 },
            { key: "musicindex", type: "uint32", wireType: 136 },
            { key: "entindex", type: "int32", wireType: 144 },
            { key: "petindex", type: "uint32", wireType: 152 },
        ];
    
        const writer:Writer = Writer.create();
    
        if(data.paintwear) { // PaintWear/float needs to be converted to a UInt32.
            data.paintwear = Buffer.from(new Float32Array([data.paintwear]).buffer).readUInt32LE(0)
        }
    
        for(const field of itemFields) {
            if(data[field.key] != null){
                (writer as any).uint32(field.wireType)[field.type](data[field.key]);
            }
        }
    
        if (data.stickers || data.keychains) {
            const stickerFields: { key: keyof Sticker, type: string, wireType: number }[] = [
              { key: "slot", type: "uint32", wireType: 8 },
              { key: "sticker_id", type: "uint32", wireType: 16 },
              { key: "wear", type: "float", wireType: 29 },
              { key: "scale", type: "float", wireType: 37 },
              { key: "rotation", type: "float", wireType: 45 },
              { key: "tint_id", type: "uint32", wireType: 48 },
              { key: "offset_x", type: "float", wireType: 61 },
              { key: "offset_y", type: "float", wireType: 69 },
              { key: "offset_z", type: "float", wireType: 77 },
              { key: "pattern", type: "uint32", wireType: 80 },
            ];
    
            if(data.stickers != null){
                for(const sticker of data.stickers) {
                    const stickerWriter:Writer = writer.uint32(/* id 12, wireType 2 =*/98).fork();
                    
                    for (const field of stickerFields) {      
                        if (sticker[field.key] != null) {
                            (stickerWriter as any)[field.type](field.wireType)[field.type](sticker[field.key]);
                        }
                    }
            
                    stickerWriter.ldelim();
                };
            };
    
            if(data.keychains != null){
                for(const keychain of data.keychains) {
                    const stickerWriter:Writer = writer.uint32(/* id 12, wireType 2 =*/162).fork();
               
                    for (const field of stickerFields) {
                        if (keychain[field.key] != null) {
                            (stickerWriter as any).uint32(field.wireType)[field.type](keychain[field.key]);
                        }
                    }
            
                    stickerWriter.ldelim();
                };
            }
        }
                    
        // Proto needs to be checksummed or it wont work.
        const encodedProto = writer.finish();
    
        const buffer = (new Uint8Array(encodedProto.length + 1));
        buffer.set(encodedProto, 1);
      
        const crc = crc32(buffer);
        const xoredCrc = (crc & 0xffff) ^ (encodedProto.length * crc);
        
        const checksumBytes = new Uint8Array(4);
        new DataView(checksumBytes.buffer).setUint32(0, xoredCrc, false);
    
        return [...buffer, ...checksumBytes].map(byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    } catch (error:any) {
        throw new Error(`Failed to serialize item preview data, an error occured: ${error?.message}`);   
    }
}