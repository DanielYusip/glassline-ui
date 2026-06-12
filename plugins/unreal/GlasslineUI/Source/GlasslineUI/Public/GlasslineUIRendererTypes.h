#pragma once

#include "CoreMinimal.h"

#include "GlasslineUIRendererTypes.generated.h"

UENUM(BlueprintType)
enum class EGlasslineInputMode : uint8
{
	None,
	GameAndUI,
	UIOnly
};

USTRUCT(BlueprintType)
struct GLASSLINEUI_API FGlasslineLayerDescriptor
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	FString Name;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	FString Url;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	int32 ZOrder = 100;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	bool bTransparent = true;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	bool bReceivesInput = false;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	EGlasslineInputMode InputMode = EGlasslineInputMode::None;
};

USTRUCT(BlueprintType)
struct GLASSLINEUI_API FGlasslineMessage
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	FString Id;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	FString Type;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Glassline UI")
	FString JsonPayload = TEXT("null");
};
