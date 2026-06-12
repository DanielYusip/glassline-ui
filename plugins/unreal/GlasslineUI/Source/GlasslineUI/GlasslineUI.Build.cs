using UnrealBuildTool;

public class GlasslineUI : ModuleRules
{
	public GlasslineUI(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"Slate",
			"SlateCore",
			"UMG",
			"Json",
			"JsonUtilities"
		});

		PrivateDependencyModuleNames.AddRange(new[]
		{
			"WebBrowser",
			"WebBrowserWidget"
		});
	}
}
