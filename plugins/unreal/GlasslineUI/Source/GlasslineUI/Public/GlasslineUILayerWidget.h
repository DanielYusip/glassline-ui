#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"

#include "GlasslineUILayerWidget.generated.h"

class UCanvasPanel;
class UWebBrowser;

UCLASS()
class GLASSLINEUI_API UGlasslineUILayerWidget : public UUserWidget
{
	GENERATED_BODY()

public:
	void LoadGlasslineUrl(const FString& Url);
	void SendJsonMessage(const FString& Json);

protected:
	virtual TSharedRef<SWidget> RebuildWidget() override;
	virtual void NativeConstruct() override;

private:
	UFUNCTION()
	void HandleConsoleMessage(const FString& Message, const FString& Source, int32 Line);

	UPROPERTY()
	TObjectPtr<UCanvasPanel> RootPanel;

	UPROPERTY()
	TObjectPtr<UWebBrowser> Browser;
};
