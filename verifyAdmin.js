module.exports= function (req,res,next){
    const userRole= req.user.role;
    if(!(userRole==='admin')) return res.status(401).send({ message: 'Access Denied for users' });
    next();
}