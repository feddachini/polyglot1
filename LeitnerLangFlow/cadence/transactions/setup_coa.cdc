import EVM from 0x8c5303eaa26202d6

transaction(pathId: Int) {
    prepare(signer: auth(Storage, IssueStorageCapabilityController, PublishCapability) &Account) {
        let coaPath = StoragePath(identifier: signer.address.toString().concat("EVM_").concat(pathId.toString()))!
        
        // Check if COA already exists at this path
        let existingCOA = signer.storage.borrow<&EVM.CadenceOwnedAccount>(from: coaPath)
        
        if existingCOA == nil {
            // Create new COA
            let coa <- EVM.createCadenceOwnedAccount()
            
            // Store the COA in account storage with the specified path
            signer.storage.save(<-coa, to: coaPath)
            
            // Create and publish the capability
            let coaCapability = signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(coaPath)
            signer.capabilities.publish(coaCapability, at: PublicPath(identifier: signer.address.toString().concat("EVM_").concat(pathId.toString()))!)
            
            log("COA created successfully at path: ".concat(coaPath.toString()))
        } else {
            log("COA already exists at path: ".concat(coaPath.toString()))
        }
    }
    
    execute {
        log("COA setup transaction completed")
    }
} 