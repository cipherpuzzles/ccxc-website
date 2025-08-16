import cryptoHmacSha1 from 'crypto-js/hmac-sha1';
import encBase64 from 'crypto-js/enc-base64';

/**
 * HMAC-SHA1加密函数
 * @param {string} content - 要加密的内容
 * @param {string} pass - 密钥
 * @returns {string} Base64编码的加密结果
 */
export function hmacSha1(content, pass) {
    let encrypted = cryptoHmacSha1(content, pass);
    let res = encBase64.stringify(encrypted);
    return res;
}

/**
 * 密码哈希函数
 * @param {string} pass - 原始密码
 * @returns {string} 加密后的密码
 */
export function passHash(pass) {
    return hmacSha1(pass, "ccxcccxc-ccxcccxc");
} 