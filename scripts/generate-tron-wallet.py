from tronpy.keys import PrivateKey

# 生成私钥
private_key_obj = PrivateKey.random()

# 获取私钥（十六进制格式）
private_key = private_key_obj.hex()

# 获取公钥
public_key = private_key_obj.public_key.hex()

# 获取地址
address = private_key_obj.public_key.to_base58check_address()

# 输出结果
print(f"Private Key: {private_key}")
print(f"Public Key: {public_key}")
print(f"Tron Address: {address}")

