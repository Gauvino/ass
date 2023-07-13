import { path } from '@tycrek/joint';
import { Router, json as BodyParserJson } from 'express';
import { log } from '../log';
import { UserConfig } from '../UserConfig';

const router = Router({ caseSensitive: true });

// Static routes
router.get('/', (req, res) => UserConfig.ready ? res.redirect('/') : res.render('setup'));
router.get('/ui.js', (req, res) => UserConfig.ready ? res.send('') : res.type('text').sendFile(path.join('dist-frontend/setup.mjs')));

// Setup route
router.post('/', BodyParserJson(), async (req, res) => {
	if (UserConfig.ready)
		return res.status(409).json({ success: false, message: 'User config already exists' });

	log.debug('Setup initiated');

	try {
		// Parse body
		new UserConfig(req.body);

		// Save config
		await UserConfig.saveConfigFile();

		return res.json({ success: true });
	} catch (err: any) {
		return res.status(400).json({ success: false, message: err.message });
	}
});

export { router };
