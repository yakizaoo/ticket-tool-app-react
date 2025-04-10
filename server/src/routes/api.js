// Users routes
router.get('/users', auth, UserController.getAll);
router.get('/users/:id', auth, UserController.getById);
router.post('/users', auth, UserController.create);
router.put('/users/:id', auth, UserController.updateById);
router.delete('/users/:id', auth, UserController.delete);
router.post('/users/:id/deactivate', auth, UserController.deactivateUser);
router.post('/users/:id/activate', auth, UserController.activateUser); 