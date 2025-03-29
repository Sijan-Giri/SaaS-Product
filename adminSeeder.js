
exports.adminSeeder = async(users) => {
    const adminExists = await users.findAll({
        where : {
            email : "girisijan346@gmail.com"
        }
    })
    if(adminExists.length == 0) {
        await users.create({
            email : "girisijan346@gmail.com",
            username : "Sijan Giri",
            googleId : "117388308426783802762",
            role : "admin"
        })
        console.log("Admin Seeded Successfully");
    }
    else {
        console.log("Admin already seeded!")
    }
}