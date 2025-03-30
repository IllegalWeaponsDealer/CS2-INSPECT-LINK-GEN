import { crc32 } from "crc";
import { CEconItemPreviewDataBlock } from "./CEconItemPreviewDataBlock"

interface Sticker {
    slot?:number | null
    stickerId?:number | null
    wear?:number | null
    scale?:number | null
    rotation?:number | null
    tintId?:number | null
    offsetX?:number | null
    offsetY?:number | null
    offsetZ?:number | null 
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
 * @param {CEconItemPreviewData} - The preview data of type `CEconItemPreviewData` used to generate the serialized data.
 * @returns {string} A serialized string that represents the inspect command data.
*/
export function serialize(data:CEconItemPreviewData):string {
    try {
        if(data.paintwear) { // PaintWear/float needs to be converted to a UInt32.
            data.paintwear = Buffer.from(new Float32Array([data.paintwear]).buffer).readUInt32LE(0)
        }

        const encodedProto = CEconItemPreviewDataBlock.encode(
            CEconItemPreviewDataBlock.create(data)
        ).finish();

        const buffer = (new Uint8Array(encodedProto.length + 1));
        buffer.set(encodedProto, 1);
      
        // This throws an error of array8 buffer not assainable to input buffer.
        // I know it works without error and icba to try and find a "fix" for something that already works fine. 
        // @ts-ignore
        const crc = crc32(buffer);
        const xoredCrc = (crc & 0xffff) ^ (encodedProto.length * crc);
        
        const checksumBytes = new Uint8Array(4);
        new DataView(checksumBytes.buffer).setUint32(0, xoredCrc, false);
    
        return ([...buffer, ...checksumBytes].map(byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase());
    } catch (error:any) {
        return error;
    }
}

/**
 * Deserializes item preview command strings for CS2 and CSGO
 * 
 * Example output:
 * ```
 *  CEconItemPreviewDataBlock2 {
        stickers: [],
        keychains: [],
        defindex: 60,
        paintindex: 440,
        rarity: 5,
        paintwear: 0.005411375779658556,
        paintseed: 353
    }
 * ```
 * @param {string} - The encoded string, should be just the data part, remove any link or csgo_econ_action_preview.
 * @returns {CEconItemPreviewData} - The decoded data.
*/
export function deserialize(inspectUrl: string): CEconItemPreviewData {
    try {
        // Convert string to byte array
        const byteArray = new Uint8Array(
            inspectUrl.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        // Remove last 4 bytes for checksum reasons
        const dataBuffer = byteArray.slice(0, -4);

        // Decode
        const decodedData = CEconItemPreviewDataBlock.decode(dataBuffer.slice(1)); // Remove lead byte

        // We have to convert our paintwear from uint32
        if (decodedData.paintwear) {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setUint32(0, decodedData.paintwear, true);
            // @ts-ignore
            decodedData.paintwear = new Float32Array(buffer)[0];
        }

        return decodedData;
    } catch (error: any) {
        return error;
    }
}