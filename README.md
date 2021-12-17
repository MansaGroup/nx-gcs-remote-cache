![Banner](.github/assets/banner-thin.png)

# nx-gcs-remote-cache

![License](https://img.shields.io/github/license/MansaGroup/nx-gcs-remote-cache?style=flat-square) ![GitHub Issues](https://img.shields.io/github/issues/mansagroup/nx-gcs-remote-cache?style=flat-square) ![GitHub Stars](https://img.shields.io/github/stars/MansaGroup/nx-gcs-remote-cache?style=flat-square)

This package implements a Google Cloud Storage-backed distributed cache for
[Nrwl Nx](https://nx.dev/) monorepos.

The distributed cache allows one or more developpers, including CI/CD
pipelines to share the same task cache, allowing one to not run a task
already ran by someone else when the code did not changed.

> Nx provides Nx Cloud, a SaaS allowing you and your team to have a
> distributed cache and task runner to avoid the hassle of having
> your computer to burn when building your entire monorepo.

This plugin **only** provides a distributed cache implementation, not
a task runner alternative.

## Usage

Even if this plugin is installed in your workspace, the GCS cache is
opt-in by default. If the `NX_REMOTE_CACHE_BUCKET` environment variable
required is not found, this plugin will fallback to the default behavior
you already know.

To add this plugin to your workspace, please install the package from
npm using your favorite package manager:

```bash
# Install the package
npm install --save-dev @mansagroup/nx-gcs-remote-cache
```

Then, change your task runner for the one provided by the plugin in your
`nx.json` file:

```js
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@mansagroup/nx-gcs-remote-cache"
    }
  }
}
```

Finally, set your `NX_REMOTE_CACHE_BUCKET` environment variable to the name
of your Google Cloud Storage bucket to use as cache container.

> This plugin consider that you've already configured your Google Cloud CLI,
> especially the application default credentials using
> `gcloud auth application-default login` if you work locally. The procedure
> for an automated environment such as a CI/CD can differ.

## License

This project is [MIT licensed](LICENSE.txt).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://jeremylvln.fr/"><img src="https://avatars.githubusercontent.com/u/6763873?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jérémy Levilain</b></sub></a><br /><a href="https://github.com/MansaGroup/nx-gcs-remote-cache/commits?author=IamBlueSlime" title="Code">💻</a> <a href="#ideas-IamBlueSlime" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
