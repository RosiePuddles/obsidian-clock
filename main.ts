import { Plugin, App, Setting, PluginSettingTab } from "obsidian";

export default class ClockPlugin extends Plugin {
  bar_elem: HTMLElement
  settings: ClockSettings

  async onload() {
    await this.loadSettings();
    this.bar_elem = this.addStatusBarItem();
    this.updateStatusBar();
    this.addSettingTab(new ClockSettingsTab(this.app, this));
    this.registerInterval(window.setInterval(() => this.updateStatusBar()))
  }

  async onunload() {
    await this.saveSettings()
  }

  updateStatusBar() {
    let d = new Date();
    switch (this.settings.format) {
      case "24":
        this.bar_elem.innerText = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        break
      case "12":
        this.bar_elem.innerText =  `${((d.getHours() - 1) % 12) + 1}:${d.getMinutes()}:${d.getSeconds()} ${d.getHours() > 11 ? "AM" : "PM"}`;
        break
      case "10":
        const s = `${(d.getHours() * 60*60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000) / 86.4}`;
        this.bar_elem.innerText =  `${s.charAt(0)}:${s.charAt(1)}${s.charAt(2)}:${s.charAt(4)}${s.charAt(5)}`;
        break
      default:
        break
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

interface ClockSettings {
  format: string;
}

const DEFAULT_SETTINGS: ClockSettings = {
  format: "24",
}

class ClockSettingsTab extends PluginSettingTab {
  plugin: ClockPlugin;

  constructor(app: App, plugin: ClockPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Clock settings'});

    new Setting(containerEl)
        .setName('Radix style')
        .addDropdown(dc => dc
            .addOptions({"24": "24 hour", "12": "12 hour", "10": "Base 10"})
            .onChange(async (value) => {
              this.plugin.settings.format = value;
              await this.plugin.saveSettings();
            })
        );
  }
}
