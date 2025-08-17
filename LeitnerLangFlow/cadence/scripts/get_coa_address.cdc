import EVM from 0x8c5303eaa26202d6

access(all) fun main(addr: Address, pathId: Int): EVM.EVMAddress? {
    let account = getAccount(addr)
    let publicPath = PublicPath(identifier: addr.toString().concat("EVM_").concat(pathId.toString()))!
    
    if let coa = account.capabilities.get<&EVM.CadenceOwnedAccount>(publicPath).borrow() {
        return coa.address()
    }
    return nil
} 