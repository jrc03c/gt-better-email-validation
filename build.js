let fs = require("fs")
let gt = require("gt-helpers")

async function build(){
	let topLevelDomains = fs.readFileSync("top-level-domains.txt", "utf8").split("\n")
	let temp = {}
	topLevelDomains.forEach(tld => temp[tld] = 1)
	topLevelDomains = gt.object.toAssociation(temp).split(" ").join("")

	let tests = ""
	let testEmails = {
		"someone@example.com": true,
		"s.o.m.e.o.n.e@e.x.a.m.p.l.e.c.o.m": true,
		"someone+test@example.com": true,
		"someone@example+test.com": true,
		"someone@example": false,
		"someone@雨.com": true,
		"雨@example.com": true,
		"雨@雨.雨": true,
		"someone@1.2.3.4": true,
		"@example.com": false,
		"someone@": false,
		"someone@example.thisshouldfail": false,
	}

	Object.keys(testEmails).forEach(function(email){
		let shouldPass = testEmails[email]

		tests += `
			>> betterEmailValidationInput = "${email}"
			*program: Better Email Validation
			*if: betterEmailValidationOutput = ${shouldPass ? '"yes"' : '"no"'}
				*component
					*classes: alert alert-success
					PASSED "${email}"!
			*if: not (betterEmailValidationOutput = ${shouldPass ? '"yes"' : '"no"'})
				*component
					*classes: alert alert-danger
					FAILED "${email}"!
					({betterEmailValidationFailMessage})
		`
	})

	let data = {
		topLevelDomains,
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
