import EVM from 0x8c5303eaa26202d6

access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)
    
    // Try to get the COA capability
    let coaCapability = account.capabilities.borrow<&EVM.CadenceOwnedAccount>(/public/evm)
    
    if let coa = coaCapability {
        // COA exists, get its EVM address
        let evmAddress = coa.address()
        return {
            "hasCOA": true,
            "evmAddress": evmAddress.toString(),
            "flowAddress": address.toString()
        }
    } else {
        return {
            "hasCOA": false,
            "evmAddress": nil,
            "flowAddress": address.toString()
        }
    }
} 