let fs = require("fs")
let gt = require("gt-helpers")

async function build(){
	let upperToLower = {}
	let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	alpha.split("").forEach(a => upperToLower[a] = a.toLowerCase())
	upperToLower = gt.object.toAssociation(upperToLower).split(" ").join("")

	let topLevelDomains = fs.readFileSync("top-level-domains.txt", "utf8").split("\n").filter(tld => tld.length > 0).map(tld => tld.toLowerCase())

	let topLevelConditionals = topLevelDomains.map(function(tld){
		return `
			*if: betterEmailValidationDomainExtension = "${tld}"
				*return
		`.trim()
	}).join("\n")

	let testEmails = {
		"someone@example.com": true,
		"s.o.m.e.o.n.e@e.x.a.m.p.l.e.com": true,
		"someone+test@example.com": true,
		"someone@example+test.com": true,
		"someone@example": false,
		"someone@雨.com": true,
		"雨@example.com": true,
		"雨@雨.雨": false,
		"someone@1.2.3.4": false,
		"@example.com": false,
		"someone@": false,
		"someone@example.thisshouldfail": false,
		"someoneexamplecom": false,
		"someone.example@com": false,
		"someone@123.456.789": false,
		"SOMEONE@EXAMPLE.COM": true,
		"someone@.com": false,
		"someone@example test.com": false,
	}

	let tests = Object.keys(testEmails).map(function(email){
		let shouldPass = testEmails[email]

		return `
			>> email = "${email}"
			>> shouldPass = "${shouldPass ? "yes" : "no"}"
			>> betterEmailValidationInput = email
			*program: Better Email Validation

			*if: betterEmailValidationOutput = shouldPass
				*component
					*classes: alert alert-success
					PASSED "${email}"! (handle: "{betterEmailValidationHandle}", domain: "{betterEmailValidationDomain}", extension: "{betterEmailValidationDomainExtension}", message: "{betterEmailValidationFailMessage}")

			*if: not (betterEmailValidationOutput = shouldPass)
				*component
					*classes: alert alert-danger
					FAILED "${email}"! (handle: "{betterEmailValidationHandle}", domain: "{betterEmailValidationDomain}", extension: "{betterEmailValidationDomainExtension}", message: "{betterEmailValidationFailMessage}")
		`
	}).join("\n\n")

	let data = {
		upperToLower,
		topLevelConditionals,
		tests,
	}

	let template = fs.readFileSync("program-template.gt", "utf8")
	let out = await gt.template.liquidBuild(template, data)
	fs.writeFileSync("program.gt", out, "utf8")

	let testsTemplate = fs.readFileSync("tests-template.gt", "utf8")
	let testsOut = await gt.template.liquidBuild(testsTemplate, data)
	fs.writeFileSync("tests.gt", testsOut, "utf8")
}

build()
