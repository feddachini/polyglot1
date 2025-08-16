import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "LeitnerLang",
        path: "../contracts/LeitnerLang.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}