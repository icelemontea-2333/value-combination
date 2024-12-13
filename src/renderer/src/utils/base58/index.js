  import basex from './utils/base-x'

  const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const bs58 = basex(BASE58);

  export function decode(value){
    let str = "";
    try{
      const decoded = bs58.decode(value);
      str = String.fromCharCode.apply(null,decoded);
    }catch(e){
      console.error(e);
    }
    return str;
  }

  export function base58ToString(value){
    return decode(value)
  }

  export function encode(str){
    let result = '';
    try{
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(str);
      result = bs58.encode(uint8Array);
    }catch(e){
      console.error(e);
    }
    return result;
  }

  export function stringToBase58(str){
    return encode(str)
  }
