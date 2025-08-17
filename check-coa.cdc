import "EVM"

access(all) fun main(addr: Address): Address? {
    let account = getAccount(addr)
    if let coa = account.capabilities.get<&EVM.CadenceOwnedAccount>(/public/evm).borrow() {
        return coa.address()
    }
    return nil
} 